import { INotif, NOTIF_TYPES } from "../../../shared/types"
import { NotifEntity } from "./notif.entity"
import { INotifExtendInfo } from "./notif.map"

export interface INotifRepository {
    getNotifsByUserId: (userId: string, offset: number, limit: number) => Promise<INotifExtendInfo[]>
    getNotifType: (notifType: keyof typeof NOTIF_TYPES) => Promise<NotifEntity | null>
    createNewVideoNotifs: (videoId: string, consumerIds: string[], notifTypeId: string) => Promise<NotifEntity>
    updateNotifById: (notifId: string) => Promise<boolean>
}