import { extractAllStats } from "./extractAllStats.js";
import { extractLastMatches } from "./extractLastMatches.js";
import { extractLastSeasonStats } from "./extractLastSeasonStats.js";
import { checkServerStatusAndSendMessage } from './checkServerStatusAndSendMessage.js';

export async function handleTelegramUpdate(request) {
  try {
  const { message } = await request.json();

  if (!message?.text) {
    return new Response('OK', { status: 200 });
  }

  const messageTimestamp = message.date;
  const lastMessageTimestamp = parseInt(await DATABASE.get('lastMessageTimestamp')) || 0;

  // Check for bug - if the timestamp of the current message is less than or equal to the last message timestamp, return without doing anything
  if (messageTimestamp <= lastMessageTimestamp) {
    return new Response('OK', { status: 200 });
  }

  const messageText = message.text.trim().split(/\s+/);
  const command = messageText[0];

  // Check for bug - if command does not start with /status and is not in the list of allowed commands, return without doing anything
  if (!['/status', '/s', '/f', '/l'].includes(command)) {
    return new Response('OK', { status: 200 });
  }

  const chatId = message.chat.id;
  let usernames = messageText.slice(1).map(username => username.toUpperCase());

  // Check if the user typed "/s my", "/f my", or "/l my"
  const myIndex = usernames.indexOf("M");
  if (myIndex !== -1) {
    usernames[myIndex] = MY_USERNAME; // Replace "MY" with the actual username
  }

  const requestedBy = message.from.username; // Get the username of the user who sent the command

  // Check for bug - if the chat ID is not in the list of allowed chat IDs, return without doing anything
  if (!ALLOWED_CHAT_ID.includes(chatId)) {
    return new Response('OK', { status: 200 });
  }

  // Handle /status command separately
  if (command.startsWith('/status')) {
    return checkServerStatusAndSendMessage(false, chatId, message.message_id, requestedBy);
  }

  const sendMessageUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const loadingMessage = {
    chat_id: chatId,
    text: `Loading ${usernames.join(', ')}...`,
    reply_to_message_id: message.message_id
  };

  // Optimization - Use await instead of then()
  const sentMessageData = await fetch(sendMessageUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loadingMessage),
  }).then(res => res.json());

  // Check for bug - if no result or no message ID was returned, return without doing anything
  if (!sentMessageData?.result?.message_id) {
    return new Response('OK', { status: 200 });
  }

  const messageId = sentMessageData.result.message_id;

  // Get the last message ID from DATABASE
  const lastMessageId = await DATABASE.get('lastMessageId');

  // Delete the previous message if there was one
  if (lastMessageId !== null) {
    const deleteMessageUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteMessage`;
    const deleteMessageBody = { chat_id: chatId, message_id: lastMessageId };

    // Optimization - Use await instead of then()
    await fetch(deleteMessageUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deleteMessageBody),
    });
  }

  // Optimization - Use Promise.all() to run all requests in parallel and wait for them to finish
  const result = await Promise.all(usernames.map(async (username) => {
    const url = command === "/l"
      ? `https://r6.tracker.network/profile/psn/${username}/matches`
      : `https://r6.tracker.network/profile/psn/${username}`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    const text = await response.text();

    if (command === "/s") {
      return extractLastSeasonStats(text, username);
    } else if (command === "/f") {
      return extractAllStats(text, username);
    } else if (command === "/l") {
      return extractLastMatches(text, username);
    }
  }));

  let output = '';
  let notFoundCount = 0;

  result.forEach((res) => {
    if (res === null) {
      notFoundCount++;
    } else {
      output += `\n\nAsked Stats: ${requestedBy}\n—————————————————\nName: ${res.username}${res.stats}`;
    }
  });

  if (notFoundCount === usernames.length) {
    output = 'Username(s) not found!';
  } else if (notFoundCount > 0) {
    output += '\n\nSome username(s) not found!';
  }

  const editMessageUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`;
  const editMessageBody = { chat_id: chatId, message_id: messageId, text: output };

  await fetch(editMessageUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(editMessageBody),
  });

  // Set the last message ID to the newly sent message in DATABASE
  await DATABASE.put('lastMessageId', messageId);
  await DATABASE.put('lastMessageTimestamp', messageTimestamp.toString());

  return new Response('OK', { status: 200 });
} catch (error) {
  console.error(error);
  return new Response('OK', { status: 200 });
}
}
