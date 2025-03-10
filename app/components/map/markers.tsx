"use client";

import { pxToMeters, SplitRect, SplitTileRegion } from "@/lib/area";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { useRouter } from "next/navigation";
import { Cluster, User } from "@/lib/types";
import { EMOTICONS } from "@/lib/emoticon";
import { emitAsync } from "@/lib/server";
import useSWR from "swr";


type ViewShiftResponse = { posts: Cluster[], users: User[] };
type UseClustersType = {
    data?: ViewShiftResponse;
    error?: Error;
    isLoading: boolean;
};
function useClusters(view?: SplitRect): UseClustersType {
    return useSWR("view-shift", async () => {
        return view? 
            await emitAsync<ViewShiftResponse>("view-shift", { view }) :
            { posts: [], users: []};
    });
}


type Props = { 
    view?: SplitRect 
}
export default function Markers({ view }: Props) {
    const router = useRouter();

    const { data } = useClusters(view);

    // const [_, forceUpdate] = useReducer(x => x + 1, 0);
    // useEffect(() => {
    //     pois.addPoisChangedHandler(forceUpdate);
    //     return () => pois.removePoisChangedHandler(forceUpdate);
    // }, []);

    if (!data) return <></>;
    const { users, posts } = data;

    function handlePostClicked(id: string) {
        router.replace("/posts/" + id, { scroll: false });
    }

    return (
        <>
            {
                users.map(user => 
                    <AdvancedMarker
                        key={user._id}
                        position={{lng: user.pos![1], lat: user.pos![0]}}
                    >
                        <div className="avatar translate-y-1/2">
                            {EMOTICONS[user.avatar]}
                            <p>{user.username}</p>
                        </div>
                    </AdvancedMarker>
                )
            }
            {
                posts.map(cluster => 
                    <AdvancedMarker
                        key={cluster.id}
                        position={{lng: cluster.y, lat: cluster.x}}
                    >
                        {
                            cluster.blurb? 
                                <div 
                                    className="post-marker" 
                                    onClick={() => handlePostClicked(cluster.id)}
                                >
                                    post
                                    <p> {cluster.blurb} </p>
                                </div> 
                                :
                                <div className="post-marker bg-red-400 after:border-t-red-400">
                                    {cluster.size}x
                                </div>
                        }
                    </AdvancedMarker>
                )
            }
        </>
    );
}