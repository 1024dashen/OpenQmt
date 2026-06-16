import type { LearnPost } from '../types'

const sampleVideo =
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
const sampleAudio =
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'

export const learnPosts: LearnPost[] = [
    {
        id: 1,
        type: 'article',
        title: 'K线基础：阳线阴线与经典形态',
        cover: 'https://picsum.photos/seed/kline/400/280',
        coverHeight: 200,
        author: '量化小白',
        likes: 1286,
        level: '初级',
        category: 'basic',
        content: `<img src="https://picsum.photos/seed/kline1/800/500" alt="K线图示意" />
<h3>什么是K线？</h3>
<p>K线（Candlestick Chart）是最基础的技术分析工具，起源于日本米市，现广泛应用于股票、期货、外汇等市场。</p>
<video controls playsinline src="${sampleVideo}"></video>
<p>下方为语音讲解，适合通勤时收听：</p>
<audio controls src="${sampleAudio}"></audio>
<h4>阳线（红色）</h4>
<p>收盘价 &gt; 开盘价，表示上涨。实体越长，买方力量越强。</p>
<ul><li><b>大阳线</b>：强烈看涨信号，通常伴随放量</li><li><b>小阳线</b>：多空力量接近，趋势可能延续</li><li><b>上影阳线</b>：上方有卖压，需关注阻力位</li></ul>
<img src="https://picsum.photos/seed/kline2/800/450" alt="经典K线形态" />
<h4>阴线（绿色）</h4>
<p>收盘价 &lt; 开盘价，表示下跌。实体越长，卖方力量越强。</p>
<h4>十字星</h4>
<p>开盘价与收盘价接近，多空势均力敌，常出现在趋势末端，可能是反转信号。</p>`,
    },
    {
        id: 2,
        type: 'video',
        title: '3分钟看懂均线金叉死叉',
        cover: 'https://picsum.photos/seed/ma/400/320',
        coverHeight: 240,
        author: '趋势猎手',
        likes: 2341,
        level: '初级',
        category: 'basic',
        videoUrl: sampleVideo,
        duration: '3:12',
        description:
            '移动平均线是最常用的趋势指标。本视频讲解 MA5、MA20、MA60 的含义，以及金叉、死叉的实战用法。',
    },
    {
        id: 3,
        type: 'article',
        title: 'MACD指标：趋势跟踪的核心工具',
        cover: 'https://picsum.photos/seed/macd/400/260',
        coverHeight: 180,
        author: '指标达人',
        likes: 987,
        level: '中级',
        category: 'strategy',
        content: `<h3>MACD 指标</h3>
<p>MACD（Moving Average Convergence Divergence）是经典的趋势跟踪指标，由 Gerald Appel 提出。</p>
<img src="https://picsum.photos/seed/macd1/800/480" alt="MACD 指标示意图" />
<h4>组成要素</h4>
<ul><li><b>DIF线</b>：12日EMA - 26日EMA，反映短期与长期趋势差</li><li><b>DEA线</b>：DIF的9日EMA，信号线</li><li><b>MACD柱</b>：(DIF - DEA) × 2，动能强弱</li></ul>
<h4>买卖信号</h4>
<p>DIF上穿DEA为<b>金叉</b>，买入信号；下穿为<b>死叉</b>，卖出信号。顶背离看跌，底背离看涨。</p>
<audio controls src="${sampleAudio}"></audio>`,
    },
    {
        id: 4,
        type: 'video',
        title: 'KDJ超买超卖实战教学',
        cover: 'https://picsum.photos/seed/kdj/400/300',
        coverHeight: 220,
        author: '短线王',
        likes: 1567,
        level: '中级',
        category: 'strategy',
        videoUrl:
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        duration: '4:28',
        description:
            'KDJ是经典的超买超卖指标。K>80超买可能回调，K<20超卖可能反弹，注意强势趋势中的钝化现象。',
    },
    {
        id: 5,
        type: 'article',
        title: 'RSI相对强弱：判断多空力量',
        cover: 'https://picsum.photos/seed/rsi/400/340',
        coverHeight: 250,
        author: '价值发现',
        likes: 743,
        level: '中级',
        category: 'strategy',
        content: `<h3>RSI 相对强弱指标</h3>
<p>RSI 衡量一段时间内价格上涨与下跌幅度的比值，取值 0-100。</p>
<img src="https://picsum.photos/seed/rsi1/800/500" alt="RSI 超买超卖区域" />
<ul><li>RSI &gt; 80：超买区域，注意回调风险</li><li>RSI &lt; 20：超卖区域，关注反弹机会</li><li>RSI = 50：多空平衡</li></ul>
<h4>背离信号</h4>
<p>价格创新高但 RSI 未创新高为<b>顶背离</b>，看跌；价格创新低但 RSI 未创新低为<b>底背离</b>，看涨。</p>
<img src="https://picsum.photos/seed/rsi2/800/420" alt="RSI 背离示意" />
<video controls playsinline src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"></video>`,
    },
    {
        id: 6,
        type: 'video',
        title: '布林带缩口变盘信号解析',
        cover: 'https://picsum.photos/seed/boll/400/290',
        coverHeight: 195,
        author: '波段操作',
        likes: 1102,
        level: '中级',
        category: 'strategy',
        videoUrl:
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        duration: '5:06',
        description:
            '布林带通过标准差判断价格波动区间。触及上轨可能回调，触及下轨可能反弹，缩口预示即将变盘。',
    },
    {
        id: 7,
        type: 'article',
        title: '量价配合：技术分析的核心原则',
        cover: 'https://picsum.photos/seed/volume/400/270',
        coverHeight: 185,
        author: '量价分析',
        likes: 892,
        level: '初级',
        category: 'basic',
        content: `<h3>成交量分析</h3>
<p>量在价先，成交量是价格变动的燃料。</p>
<img src="https://picsum.photos/seed/volume1/800/520" alt="量价配合示意图" />
<ul><li><b>量增价升</b>：健康上涨，趋势可持续</li><li><b>量缩价升</b>：上涨动力不足，警惕见顶</li><li><b>量增价跌</b>：抛压沉重，可能继续下行</li><li><b>天量天价</b>：常见顶部特征</li></ul>
<audio controls src="${sampleAudio}"></audio>`,
    },
    {
        id: 8,
        type: 'article',
        title: '支撑与阻力：买卖时机的基石',
        cover: 'https://picsum.photos/seed/support/400/310',
        coverHeight: 230,
        author: '结构分析',
        likes: 654,
        level: '初级',
        category: 'basic',
        content: `<h3>支撑与阻力</h3>
<p>支撑位是价格下跌时可能获得买盘的位置；阻力位是价格上涨时可能遇到卖压的位置。</p>
<img src="https://picsum.photos/seed/support1/800/540" alt="支撑阻力位示意" />
<ul><li>前期高低点</li><li>整数关口（如 3000 点）</li><li>均线位置</li><li>成交密集区</li></ul>
<p>有效突破后，支撑与阻力往往<b>角色互换</b>。</p>`,
    },
    {
        id: 9,
        type: 'video',
        title: '筹码分布看懂主力吸筹派发',
        cover: 'https://picsum.photos/seed/chip/400/330',
        coverHeight: 245,
        author: '主力追踪',
        likes: 1876,
        level: '高级',
        category: 'strategy',
        videoUrl:
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        duration: '6:45',
        description:
            '筹码分布反映持仓成本结构。筹码密集形成支撑/阻力，单峰密集后往往面临方向选择。低位集中吸筹、高位密集派发是主力常见手法。',
    },
    {
        id: 10,
        type: 'article',
        title: '波浪理论入门：5浪上涨3浪回调',
        cover: 'https://picsum.photos/seed/wave/400/250',
        coverHeight: 170,
        author: '波浪信徒',
        likes: 521,
        level: '高级',
        category: 'strategy',
        content: `<h3>艾略特波浪理论</h3>
<p>市场以 5-3 浪模式运行：5 浪推动趋势，3 浪调整回调。</p>
<img src="https://picsum.photos/seed/wave1/800/500" alt="五浪推动示意" />
<ul><li><b>推动浪</b>：1、3、5 浪与趋势同向</li><li><b>调整浪</b>：2、4 浪与趋势反向</li><li><b>ABC 回调</b>：A、B、C 三浪调整</li></ul>
<img src="https://picsum.photos/seed/wave2/800/480" alt="三浪回调示意" />
<p>波浪计数主观性强，实践中争议较大，建议结合均线、MACD 等指标综合判断。</p>
<audio controls src="${sampleAudio}"></audio>`,
    },
]
