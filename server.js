import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// 静的ファイルを serve
app.use(express.static(__dirname));

// ========== データベース（メモリ） ==========
const users = [
  {
    id: 'user1',
    name: '田中太郎',
    username: '@tarou',
    phase: '起業志望',
    bio: 'スタートアップに挑戦中。技術好きな起業志望者です',
    location: '東京都渋谷区',
    latitude: 35.6595,
    longitude: 139.7004,
    followers: ['user2', 'user3'],
    following: ['user2', 'user3'],
    avatar: '👨‍💼'
  },
  {
    id: 'user2',
    name: '鈴木花子',
    username: '@hanako',
    phase: 'スタートアップ運営',
    bio: 'EdTech企業のCEO。投資家との出会いを求めています',
    location: '東京都新宿区',
    latitude: 35.6762,
    longitude: 139.7394,
    followers: ['user1'],
    following: ['user1', 'user3'],
    avatar: '👩‍💼'
  },
  {
    id: 'user3',
    name: '佐藤就活太',
    username: '@shukatsutarou',
    phase: '就活生',
    bio: '2026年卒。スタートアップ志向のエンジニア志望',
    location: '東京都渋谷区',
    latitude: 35.6558,
    longitude: 139.7016,
    followers: ['user1', 'user2'],
    following: ['user1', 'user2'],
    avatar: '👨‍🎓'
  },
  {
    id: 'user4',
    name: '山田投資家',
    username: '@yamada_investor',
    phase: '投資家',
    bio: 'シードからシリーズAのスタートアップに投資。新しい挑戦者募集中',
    location: '東京都港区',
    latitude: 35.6469,
    longitude: 139.7407,
    followers: [],
    following: ['user2'],
    avatar: '💼'
  }
];

let posts = [
  {
    id: 'post1',
    authorId: 'user2',
    content: '今日はプロダクト改善のミーティングでした。ユーザーの声を聞くことが本当に大事ですね。',
    timestamp: '2026-02-18T14:30:00',
    location: '東京都新宿区',
    hashtags: ['#EdTech', '#プロダクト', '#ユーザーファースト'],
    likes: ['user1', 'user3'],
    likeCount: 2
  },
  {
    id: 'post2',
    authorId: 'user1',
    content: 'NEXUSのようなプラットフォームがあれば、起業志望者同士のつながりが生まれるのに！',
    timestamp: '2026-02-18T12:15:00',
    location: '東京都渋谷区',
    hashtags: ['#起業志望', '#NEXUS', '#スタートアップ'],
    likes: ['user2', 'user3'],
    likeCount: 2
  },
  {
    id: 'post3',
    authorId: 'user3',
    content: '就活とスタートアップの両立って難しいな。でも成長できる環境を求めています。',
    timestamp: '2026-02-18T10:00:00',
    location: '東京都渋谷区',
    hashtags: ['#就活生', '#キャリア', '#成長'],
    likes: ['user1'],
    likeCount: 1
  },
  {
    id: 'post4',
    authorId: 'user4',
    content: 'シード期のスタートアップ創業者さん、ぜひお話ししましょう。今年は特に注目しています。',
    timestamp: '2026-02-18T09:00:00',
    location: '東京都港区',
    hashtags: ['#投資家', '#シード期', '#VC'],
    likes: [],
    likeCount: 0
  }
];

let messages = [
  { id: 'dm1', senderId: 'user2', recipientId: 'user1', message: 'NEXUSの構想素晴らしいですね！', timestamp: '2026-02-18T15:00:00', isRead: false },
  { id: 'dm2', senderId: 'user1', recipientId: 'user2', message: 'ありがとうございます。実現したいです', timestamp: '2026-02-18T15:05:00', isRead: true },
  { id: 'dm3', senderId: 'user2', recipientId: 'user1', message: 'ぜひ一緒に作りましょう', timestamp: '2026-02-18T15:10:00', isRead: false },
  { id: 'dm4', senderId: 'user3', recipientId: 'user1', message: 'スタートアップの情報もらえませんか？', timestamp: '2026-02-18T14:00:00', isRead: false },
  { id: 'dm5', senderId: 'user4', recipientId: 'user2', message: 'プロダクト拝見させてもらいたいです', timestamp: '2026-02-18T13:00:00', isRead: true }
];

// ========== おすすめスポット（モックデータ） ==========
const recommendedPlaces = {
  '東京都渋谷区': [
    { name: 'スターバックス 渋谷駅前店', type: 'カフェ', rating: 4.5, coupon: '10%割引' },
    { name: '渋谷ヒカリエ', type: 'コワーキング', rating: 4.7, coupon: '最初の1時間無料' },
    { name: 'ラーメン横丁', type: 'レストラン', rating: 4.3, coupon: '500円割引' },
    { name: 'The Ramen Yokocho', type: 'グルメ', rating: 4.4, coupon: 'ラーメン+ドリンク' }
  ],
  '東京都新宿区': [
    { name: 'ネスカフェ 新宿店', type: 'カフェ', rating: 4.6, coupon: '15%割引' },
    { name: 'WeWork 新宿', type: 'コワーキング', rating: 4.8, coupon: '最初の3時間無料' },
    { name: 'ホテルグレイスリーホテルズ', type: 'レストラン', rating: 4.5, coupon: 'ランチセット20%割引' },
    { name: '新宿御苑', type: 'スポット', rating: 4.4, coupon: '入園料割引' }
  ],
  '東京都港区': [
    { name: 'ブルーボトルコーヒー六本木', type: 'カフェ', rating: 4.7, coupon: 'ドリンク無料' },
    { name: 'WeWork 六本木', type: 'コワーキング', rating: 4.9, coupon: '初月50%割引' },
    { name: 'テラスダイニング', type: 'レストラン', rating: 4.6, coupon: 'ディナー20%割引' },
    { name: 'アークヒルズ', type: 'スポット', rating: 4.5, coupon: 'ショップ割引' }
  ]
};

// ========== キーワード抽出でハッシュタグ自動生成 ==========
function generateHashtags(content, userPhase) {
  const phaseHashtags = {
    '起業志望': ['#起業志望', '#スタートアップ', '#チャレンジャー'],
    'スタートアップ運営': ['#起業家', '#CEO', '#共創募集'],
    '就活生': ['#就活生', '#新卒', '#キャリア'],
    '投資家': ['#投資家', '#シード期', '#VC']
  };

  const contentKeywords = [
    { word: 'プロダクト', tag: '#プロダクト' },
    { word: 'ユーザー', tag: '#ユーザーファースト' },
    { word: '技術', tag: '#技術' },
    { word: '成長', tag: '#成長' },
    { word: 'EdTech', tag: '#EdTech' },
    { word: 'NEXUS', tag: '#NEXUS' },
    { word: 'ミーティング', tag: '#チームワーク' },
    { word: '投資', tag: '#ファンドレイジング' },
    { word: '就活', tag: '#キャリア開発' }
  ];

  const hashtags = [];

  if (phaseHashtags[userPhase]) {
    hashtags.push(...phaseHashtags[userPhase]);
  }

  contentKeywords.forEach(({ word, tag }) => {
    if (content.includes(word)) {
      hashtags.push(tag);
    }
  });

  return [...new Set(hashtags)].slice(0, 5);
}

// ========== API エンドポイント ==========

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.get('/api/posts', (req, res) => {
  res.json(posts);
});

app.post('/api/posts', (req, res) => {
  const { authorId, content, location } = req.body;

  if (!authorId || !content) {
    return res.status(400).json({ error: 'authorId and content required' });
  }

  const author = users.find(u => u.id === authorId);
  const hashtags = generateHashtags(content, author.phase);
  const postLocation = location || author.location;

  const newPost = {
    id: 'post' + (posts.length + 1),
    authorId,
    content,
    timestamp: new Date().toISOString(),
    location: postLocation,
    hashtags,
    likes: [],
    likeCount: 0
  };

  posts.unshift(newPost);
  res.json(newPost);
});

app.post('/api/posts/:postId/like', (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  const post = posts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  if (post.likes.includes(userId)) {
    post.likes = post.likes.filter(id => id !== userId);
    post.likeCount--;
  } else {
    post.likes.push(userId);
    post.likeCount++;
  }

  res.json(post);
});

app.get('/api/messages', (req, res) => {
  res.json(messages);
});

app.post('/api/messages', (req, res) => {
  const { senderId, recipientId, message } = req.body;

  if (!senderId || !recipientId || !message) {
    return res.status(400).json({ error: 'senderId, recipientId, message required' });
  }

  const newMsg = {
    id: 'dm' + (messages.length + 1),
    senderId,
    recipientId,
    message,
    timestamp: new Date().toISOString(),
    isRead: false
  };

  messages.push(newMsg);
  res.json(newMsg);
});

app.post('/api/messages/:msgId/read', (req, res) => {
  const { msgId } = req.params;

  const msg = messages.find(m => m.id === msgId);
  if (!msg) {
    return res.status(404).json({ error: 'Message not found' });
  }

  msg.isRead = true;
  res.json(msg);
});

app.post('/api/users/:userId/follow', (req, res) => {
  const { userId } = req.params;
  const { currentUserId } = req.body;

  const currentUser = users.find(u => u.id === currentUserId);
  const targetUser = users.find(u => u.id === userId);

  if (!currentUser || !targetUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (currentUser.following.includes(userId)) {
    currentUser.following = currentUser.following.filter(id => id !== userId);
    targetUser.followers = targetUser.followers.filter(id => id !== currentUserId);
  } else {
    currentUser.following.push(userId);
    targetUser.followers.push(currentUserId);
  }

  res.json({ currentUser, targetUser });
});

// 位置情報によるおすすめスポット取得
app.get('/api/places/:location', (req, res) => {
  const { location } = req.params;
  const decodedLocation = decodeURIComponent(location);
  const places = recommendedPlaces[decodedLocation] || [];
  res.json({ location: decodedLocation, places });
});

// 全ユーザーの位置情報取得
app.get('/api/locations', (req, res) => {
  const locations = users.map(u => ({
    id: u.id,
    name: u.name,
    location: u.location,
    latitude: u.latitude,
    longitude: u.longitude,
    avatar: u.avatar,
    phase: u.phase
  }));
  res.json(locations);
});

app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'NEXUS API is running with location features' 
  });
});

// SPA対応
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

// ========== サーバー起動 ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 NEXUS server running on http://localhost:${PORT}`);
  console.log(`✨ Location features enabled`);
});
