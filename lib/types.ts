
export type Pos = [number, number];

export type Cluster = {
    id: string,
    x: number,
    y: number,
    size: number,

    blurb?: string,
}



export type User = {
    _id: string,
    pos?: [number, number],
    username: string,
    avatar: number
}

export enum Vote {
    NONE = "none",
    LIKE = "like",
    DISLIKE = "dislike",
}