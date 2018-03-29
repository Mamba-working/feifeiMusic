### feifeiMusic

做的一个相比于之前的音乐播放器更完善的播放器,有歌词滚动效果，从外部api获取的歌曲信息,基本的播放器功能都有,功能还是相对完善的。
还有略微的缺陷就是，歌词滚动没有根据每句歌词的时间调速度，并且如果外部api获取数据失败没有做错误处理。
每次获取的歌曲也是随机的

### 碰到的问题

有个问题暂时还没解决，就是歌词滚动的时候速度是固定的，如果一段歌词时间很短，那么会动画还没完，就开始放下一段歌词了。
解决的思路应该是计算生成的对象的下一个歌词和这一段的时间差，然后设置setInterval，不过由于是对象操作起来比较麻烦，暂时还没修改。

还有就是一开始整体布局没有使用vh单位，画面缩放看起来不舒适，后面修改了就可以了。

点击专辑的时候怎么把数据从footer传到Fm对象，最后采用了自定义事件，给Fm绑定了自定义事件，点击footer的ul的时候触发这个事件(由于li一开始没有所以采用事件代理),这样两个模块分别处理自己的事件，独立开来。

### 采用技术

jquery , animate.css , 原生js


### 收获

增强了自己的动手能力，也算对自己理论的实践，也可以作为简历的一个项目。由于是使用js，没有使用框架，更加锻炼自己的编程思想(类似于封装，各部分分工明确之类的)
后续会继续完善功能，预下次更新加入歌词拖动


## 更新
这次更新未加入歌词拖动，加入了搜索功能,借用了Binaryify在github上的[网易云音乐api](https://github.com/Mamba-working/NeteaseCloudMusicApi)
不过由于api的图片似乎出了问题,搜索的歌只使用了一张图片作为替代.由于两个api的歌词格式有区别,个别歌曲的歌词会显示时间
## 更新2
增加了搜索结果的显示
## 使用说明
```
   1.git clone https://github.com/Mamba-working/feifei-Music.git
   2.git clone git@github.com:Binaryify/NeteaseCloudMusicApi.git
   3.参考api的文档使用npm install和set PORT=4000 && node app.js启动api
   4.然后打开feifeiMusic.html就可以使用了
```

[预览地址](https://mamba-working.github.io/feifeiMusic/feifeiMusic.html)

![](https://ws1.sinaimg.cn/large/b17846e9gy1fpu0d9ru2xj228t1binpf.jpg)
![](https://ws1.sinaimg.cn/large/b17846e9gy1fpu0htm3nzj228v1b1hdu.jpg)