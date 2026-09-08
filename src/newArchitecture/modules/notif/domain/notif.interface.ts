import { INotif, NOTIF_TYPES } from "../../../shared/types"
import { NotifEntity } from "./notif.entity"

export interface INotifRepository {
    getNotifsByUserId: (userId: string) => Promise<NotifEntity[]>
    getNotifType: (notifType: keyof typeof NOTIF_TYPES) => Promise<NotifEntity | null>
    createNewVideoNotifs: (videoId: string, consumerIds: string[], notifTypeId: string) => Promise<NotifEntity>
}