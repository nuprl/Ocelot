// The state of a error notification must have 
// open : if the message is open
// message: the message of the notification.
export type ErrorNotificationState = {
    open: boolean,
    message: string,
};