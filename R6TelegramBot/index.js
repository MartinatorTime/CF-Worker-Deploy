import { handleTelegramUpdate } from './handleTelegramUpdate.js';
import { checkServerStatusAndSendMessage, sendStatusUpdateMessage, sendCurrentStatusMessage } from './checkServerStatusAndSendMessage.js';

addEventListener('fetch', event => {
  event.respondWith(handleTelegramUpdate(event.request));
});

addEventListener('scheduled', event => {
  event.waitUntil(checkServerStatusAndSendMessage(true, CHAT_TO_SEND));
});
