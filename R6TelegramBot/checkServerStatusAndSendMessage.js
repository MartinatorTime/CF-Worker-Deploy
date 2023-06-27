export async function checkServerStatusAndSendMessage(onlyNotifyIfDownOrMaintenance, chatId, replyToMessageId) {
  const serverStatusUrl = 'https://game-status-api.ubisoft.com/v1/instances?appIds=fb4cc4c9-2063-461d-a1e8-84a7d36525fc';
  const serverStatusResponse = await fetch(serverStatusUrl);
  const serverStatusData = await serverStatusResponse.json();

  const isServerDown = serverStatusData.some(instance => instance.Status === 'Down');
  const isServerInMaintenance = serverStatusData.some(instance => instance.Status === 'Maintenance');
  const isServerDegradedAndInMaintenance = serverStatusData.some(instance => instance.Status === 'Degraded' && instance.Maintenance);

  // Get the previous server status from the database
  const previousServerStatus = await DATABASE.get('serverStatus');

  if (isServerInMaintenance || isServerDegradedAndInMaintenance) {
    if (previousServerStatus !== 'maintenance') {
      // Save the new server status to the database
      await DATABASE.put('serverStatus', 'maintenance');

      // Send a message to all allowed chats
      for (const allowedChatId of CHAT_TO_SEND) {
        await notifyServerStatus(allowedChatId, isServerDown, isServerInMaintenance, isServerDegradedAndInMaintenance);
      }
    }
  } else if (isServerDown) {
    if (previousServerStatus !== 'down') {
      // Save the new server status to the database
      await DATABASE.put('serverStatus', 'down');

      // Send a message to all allowed chats
      for (const allowedChatId of CHAT_TO_SEND) {
        await notifyServerStatus(allowedChatId, isServerDown, isServerInMaintenance, isServerDegradedAndInMaintenance);
      }
    }
  } else if (previousServerStatus !== 'up') {
    // Save the new server status to the database
    await DATABASE.put('serverStatus', 'up');

    // Send a message to all allowed chats
    for (const allowedChatId of CHAT_TO_SEND) {
      await notifyServerStatus(allowedChatId, isServerDown, isServerInMaintenance, isServerDegradedAndInMaintenance);
    }
  }

  if (!onlyNotifyIfDownOrMaintenance || isServerDown || isServerInMaintenance || isServerDegradedAndInMaintenance) {
    return sendMessageToChat(getStatusMessage(isServerDown, isServerInMaintenance, isServerDegradedAndInMaintenance), chatId, replyToMessageId);
  }
}

export async function notifyServerStatus(chatId, isServerDown, isServerInMaintenance, isServerDegradedAndInMaintenance) {
  const messageText = getStatusMessage(isServerDown, isServerInMaintenance, isServerDegradedAndInMaintenance);
  await sendMessageToChat(messageText, chatId);
}

export function getStatusMessage(isServerDown, isServerInMaintenance, isServerDegradedAndInMaintenance) {
  if (isServerDegradedAndInMaintenance) {
    return '🔧 R6 PSN Сервер находится на техническом обслуживании.';
  } else if (isServerDown) {
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