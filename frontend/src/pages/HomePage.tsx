import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, type Post } from '../lib/api';
import { useApi } from '../hooks/useApi';
import PostList from '../components/posts/PostList';
import { shellLabel } from '../lib/utils';

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const shell = searchParams.get('shell') || undefined;
  const sort = searchParams.get('sort') || 'recent';
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);

  const { data, loading, error } = useApi(
    () => {
      setAllPosts([]);
      return api.getPosts({ ...(shell ? { shell } : {}), sort });
    },
    [shell, sort]
  );

  const displayPosts = allPosts.length > 0 ? allPosts : (data?.posts ?? []);
  const total = data?.total ?? 0;
  const hasMore = displayPosts.length < total;

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const result = await api.getPosts({
        ...(shell ? { shell } : {}),
        sort,
        offset: String(displayPosts.length),
      });
      setAllPosts([...displayPosts, ...result.posts]);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-100">
          {shell ? shellLabel(shell) : 'All Catches'}
        </h1>
        <div className="flex gap-1">
          {['recent', 'top', 'trending'].map((s) => (
            <button
              key={s}
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set('sort', s);
                setSearchParams(params);
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                sort === s
                  ? 'bg-claw-600 text-white'
                  : 'bg-ocean-800 text-ocean-300 hover:bg-ocean-700'
              }`}
            >
              {s === 'recent' ? 'Fresh' : s === 'top' ? 'Top Catches' : 'Tide Pool'}
            </button>
          ))}
        </div>
      </div>

      <PostList
        posts={displayPosts}
        loading={loading}
        error={error}
      />

      {hasMore && (
        <div className="text-center mt-4">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-4 py-2 bg-ocean-800 text-ocean-300 rounded-lg hover:bg-ocean-700 disabled:opacity-50 text-sm"
          >
            {loadingMore ? 'Loading...' : `Load more (${displayPosts.length} of ${total})`}
          </button>
        </div>
      )}
    </div>
  );
}
