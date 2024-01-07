export async function checkServerStatusAndSendMessage(onlyNotifyIfDownOrMaintenance, chatId, replyToMessageId) {
  const serverStatusUrl = 'https://game-status-api.ubisoft.com/v1/instances?appIds=fb4cc4c9-2063-461d-a1e8-84a7d36525fc';
  const serverStatusResponse = await fetch(serverStatusUrl);
  const serverStatusData = await serverStatusResponse.json();

  const isServerInMaintenance = serverStatusData.some(instance => instance.Maintenance);
  const isServerDegraded = serverStatusData.some(instance => instance.Status === 'Degraded');

  // Get the previous server status from the KV store
  const previousServerStatus = await DATABASE.get('serverStatus');

  if (isServerInMaintenance && previousServerStatus !== 'Maintenance') {
    await DATABASE.put('serverStatus', 'Maintenance');
    await sendServerStatusNotification(chatId, replyToMessageId, isServerDegraded, isServerInMaintenance);
  } else if (isServerDegraded && previousServerStatus !== 'Degraded') {
    await DATABASE.put('serverStatus', 'Degraded');
    await sendServerStatusNotification(chatId, replyToMessageId, isServerDegraded, isServerInMaintenance);
  } else if (!isServerInMaintenance && !isServerDegraded && previousServerStatus !== 'Online') {
    await DATABASE.put('serverStatus', 'Online');
    await sendServerStatusNotification(chatId, replyToMessageId, isServerDegraded, isServerInMaintenance);
  }

  if (!onlyNotifyIfDownOrMaintenance || isServerDegraded || isServerInMaintenance) {
    return sendMessageToChat(getStatusMessage(isServerDegraded, isServerInMaintenance), chatId, replyToMessageId);
  }
}

export async function sendServerStatusNotification(chatId, replyToMessageId, isServerDegraded, isServerInMaintenance) {
  const messageText = getStatusMessage(isServerDegraded, isServerInMaintenance);
  await sendMessageToChat(messageText, chatId, replyToMessageId);
}

export function getStatusMessage(isServerDegraded, isServerInMaintenance) {
  if (isServerInMaintenance) {
    return '🔧 R6 PSN Сервер находится на техническом обслуживании.';
  } else if (isServerDegraded) {
    return '⚠️ R6 PSN Сервер испытывает проблемы и работает в ограниченном режиме.';
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
