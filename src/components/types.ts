/* posts.tsx*/
export interface PROPS {
    postId: string;
    avatar: string;
    image: string;
    text: string;
    timestamp: any;
    username: string;
}

export interface COMMENT {
    id: string;
    avatar: string;
    text: string;
    timestamp: any;
    username: string;
}