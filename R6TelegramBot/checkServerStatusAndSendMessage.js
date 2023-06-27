export async function checkServerStatusAndSendMessage(onlyNotifyIfDownOrMaintenance, chatId, replyToMessageId) {
  const serverStatusUrl = 'https://game-status-api.ubisoft.com/v1/instances?appIds=fb4cc4c9-2063-461d-a1e8-84a7d36525fc';
  const serverStatusResponse = await fetch(serverStatusUrl);
  const serverStatusData = await serverStatusResponse.json();

  const isServerDown = serverStatusData.some(instance => instance.Status === 'Degraded' || instance.Status === 'Down');
  const isServerInMaintenance = serverStatusData.some(instance => instance.Status === 'Maintenance');

  // Get the previous server status from the database
  const previousServerStatus = await DATABASE.get('serverStatus');

  if (isServerInMaintenance) {
    if (previousServerStatus !== 'maintenance') {
      // Save the new server status to the database
      await DATABASE.put('serverStatus', 'maintenance');

      // Send a message to all allowed chats
      for (const allowedChatId of CHAT_TO_SEND) {
        await notifyServerStatus(allowedChatId, isServerDown, isServerInMaintenance);
      }
    }
  } else if (isServerDown) {
    if (previousServerStatus !== 'down') {
      // Save the new server status to the database
      await DATABASE.put('serverStatus', 'down');

      // Send a message to all allowed chats
      for (const allowedChatId of CHAT_TO_SEND) {
        await notifyServerStatus(allowedChatId, isServerDown, isServerInMaintenance);
      }
    }
  } else if (previousServerStatus !== 'up') {
    // Save the new server status to the database
    await DATABASE.put('serverStatus', 'up');

    // Send a message to all allowed chats
    for (const allowedChatId of CHAT_TO_SEND) {
      await notifyServerStatus(allowedChatId, isServerDown, isServerInMaintenance);
    }
  }

  if (!onlyNotifyIfDownOrMaintenance || isServerDown || isServerInMaintenance) {
    return sendMessageToChat(getStatusMessage(isServerDown, isServerInMaintenance), chatId, replyToMessageId);
  }
}

export async function notifyServerStatus(chatId, isServerDown, isServerInMaintenance) {
  const messageText = getStatusMessage(isServerDown, isServerInMaintenance);
  await sendMessageToChat(messageText, chatId);
}

export function getStatusMessage(isServerDown, isServerInMaintenance) {
  if (isServerDown) {
    return '⚠️ R6 PSN Сервер в данный момент не работает.';
  } else if (isServerInMaintenance) {
    return '🔧 R6 PSN Сервер находится на техническом обслуживании.';
  } else {
    return '✅ R6 PSN Сервер находится в сети и работает без сбоев.';
  }
}

export async function sendMessageToChat(text, chatId, replyToMessageId) {
  const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const response = await fetch(telegramApiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      reply_to_message_id: replyToMessageId,
    }),
  });

 if (response.ok) {
    return new Response('Message sent successfully');
  }

  return new Response('Error sending message', { status: 500 });
}
