import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY
});

// ========== データベース（メモリ） ==========
const users = [
  {
    id: 'user1',
    name: '田中太郎',
    username: '@tarou',
    phase: '起業志望',
    bio: 'スタートアップに挑戦中。技術好きな起業志望者です',
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
    hashtags: ['#EdTech', '#プロダクト', '#ユーザーファースト'],
    likes: ['user1', 'user3'],
    likeCount: 2
  },
  {
    id: 'post2',
    authorId: 'user1',
    content: 'NEXUSのようなプラットフォームがあれば、起業志望者同士のつながりが生まれるのに！',
    timestamp: '2026-02-18T12:15:00',
    hashtags: ['#起業志望', '#NEXUS', '#スタートアップ'],
    likes: ['user2', 'user3'],
    likeCount: 2
  },
  {
    id: 'post3',
    authorId: 'user3',
    content: '就活とスタートアップの両立って難しいな。でも成長できる環境を求めています。',
    timestamp: '2026-02-18T10:00:00',
    hashtags: ['#就活生', '#キャリア', '#成長'],
    likes: ['user1'],
    likeCount: 1
  },
  {
    id: 'post4',
    authorId: 'user4',
    content: 'シード期のスタートアップ創業者さん、ぜひお話ししましょう。今年は特に注目しています。',
    timestamp: '2026-02-18T09:00:00',
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

// ========== Claude API でハッシュタグ自動生成 ==========
async function generateHashtagsWithClaude(content) {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `以下の投稿内容に対して、適切な日本語ハッシュタグを3-5個提案してください。JSON形式で返してください。\n\n投稿内容:\n"${content}"\n\n返す形式:\n{"hashtags": ["#ハッシュタグ1", "#ハッシュタグ2", "#ハッシュタグ3"]}`
        }
      ]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.hashtags || [];
    }
    return [];
  } catch (error) {
    console.error('Claude API error:', error);
    return [];
  }
}

// ========== API エンドポイント ==========

// ユーザー取得
app.get('/api/users', (req, res) => {
  res.json(users);
});

// 投稿一覧取得
app.get('/api/posts', (req, res) => {
  res.json(posts);
});

// 投稿作成（ハッシュタグ自動生成）
app.post('/api/posts', async (req, res) => {
  const { authorId, content } = req.body;

  if (!authorId || !content) {
    return res.status(400).json({ error: 'authorId and content required' });
  }

  // Claude API でハッシュタグ生成
  const hashtags = await generateHashtagsWithClaude(content);

  const newPost = {
    id: 'post' + (posts.length + 1),
    authorId,
    content,
    timestamp: new Date().toISOString(),
    hashtags,
    likes: [],
    likeCount: 0
  };

  posts.unshift(newPost);
  res.json(newPost);
});

// いいね機能
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

// メッセージ取得
app.get('/api/messages', (req, res) => {
  res.json(messages);
});

// メッセージ送信
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

// メッセージを既読にする
app.post('/api/messages/:msgId/read', (req, res) => {
  const { msgId } = req.params;

  const msg = messages.find(m => m.id === msgId);
  if (!msg) {
    return res.status(404).json({ error: 'Message not found' });
  }

  msg.isRead = true;
  res.json(msg);
});

// フォロー機能
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

// ステータスチェック
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'NEXUS API is running with Claude AI hashtag generation' 
  });
});

// ========== サーバー起動 ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 NEXUS server running on http://localhost:${PORT}`);
  console.log(`✨ Claude API Integration: Hashtag generation enabled`);
});
