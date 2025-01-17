//this is not for actual response, but for the type of response we expect from the server
import { Message } from '@/model/user';

export interface ApiResponse {
    success: boolean;
    message: string;
    isAcceptingMessages?: boolean;
    messages?: Array<Message>;
}