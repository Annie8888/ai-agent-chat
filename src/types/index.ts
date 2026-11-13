export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
export interface Session {
    id: string;
    title: string;
    messages: Message[];
}