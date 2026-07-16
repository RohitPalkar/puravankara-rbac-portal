export declare class CreateNotificationDto {
    userId: string;
    title: string;
    message?: string;
    notificationType?: string;
    priority?: string;
    referenceType?: string;
    referenceId?: string;
    metadata?: Record<string, any>;
}
