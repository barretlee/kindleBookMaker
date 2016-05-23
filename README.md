Kindle Book Maker
---

[中文文档](./README-zh.md)

This Project is aimed at creating a kindle book generator. Fetching data from internet, then combo all data to a mini `.mobi` book, what you have to do is just edit profiles and run build commands.

**Attention:** [/bin/kindlegen](/bin/kindlegen) in the project is just compatible with Mac OS, if you are windows user, please download the [kindleGen](http://www.amazon.com/gp/feature.html?docId=1000765211) file and replace the origin.

### Project structure

Data comes in three way:

- spider fetch a uri content, but you need to config the class the article's title and content
- spider fetch a rss source
- from local file

Here is the structure of project: 

![Kindle Book Maker](http://img.alicdn.com/tfs/TB1B_rJJVXXXXcvXXXXXXXXXXXX-809-584.png)

After preparing data, The program will filter some dirty data, and transfer remote file link to local file, that means it will download the resources.

Finally, using [kindleGen](http://www.amazon.com/gp/feature.html?docId=1000765211) generate book. I had put the kindleGen file to [/bin/kindlegen](/bin/kindlegen), 28M.

### Usage

Try a simple demo:

```bash
git clone https://github.com/barretlee/kindleBookMaker.git;
cd kindleBookMaker;
npm install;
node index;
open build/*.mobi;
```

There are lots of function, simplify to three command.

- generate from rss:
```bash
node index --rss http://barretlee.com/rss2.xml
# node index -r http://barretlee.com/rss2.xml
```
- generate from a uri，`-u URL titleQuery ContentQuery FilterRegExp`:
```bash
node index --uri \
    http://www.barretlee.com/blog/2016/04/28/mini-query/ \
    .post-title \
    .post-content \
    /<div class="shit-spider"[\s\S]+?<\/div>/
```
- generate from local directory:
```bash
node index --dirctory ./src/demo/
# node index -d ./src/demo/
```

and three other arguments:

- `--verbose`, `-v`, detail about kindle generation.
- `--help`, `-h`, help.
- `-push2kindle`, `-p`, push the builded `.mobi` file to your kindle.

### Configure

```javascript
var moment = require('moment');

module.exports = {
  // entry: './src/KF8-Demo',
  entry: {
    base: './src/KF8-Demo',
    list: []
  },
  bookInfo: {
    title: "Barret Lee's Personal Website",
    lang: "zh",
    creator: "Barret Lee",
    copyright: "Barret Lee",
    publisher: "",
    coverImage: 'coverImage.png'
  },
  /*option*/
  output: {
    base: './build',
    format: '[name]-' + moment().format('YYYYMMDD')
  },
  /*option for uri*/
  singlePage: {
    title: 'div.title',
    description: 'div.content',
    reg: function(data) {
      return data.replace(/<div class="shit-spider"[\s\S]+?<\/div>/, '');
    }
  },
  /*option*/
  push2kindle: {
    email: 'barret.china@gmail.com',
    password: 'your-email-password',
    kindle: 'barretlee.com@kindle.cn'
  }
};
```

- `entry`, can be a String or an Object
  - `base`, the entry base, where remote file placed.
  - `list`, it impacts the order of book article list.
- `bookInfo`, be attention to the `coverImage`, you should better set a value.
- `ouput`, optional, default is `./build` and `[name]`.
- `singlePage`, optional, for uri spider
- `push2kindle`, optional, the `kindle` param is your device matched email, can be edit at [here](https://www.amazon.cn/mn/dcw/myx.html/ref=kinw_myk_redirect#/home/settings/payment).


### Todo

- [ ] generate from markdown file directly.
- [ ] fix push2kindle bug, cannot push `.mobi` format file, i don't konw why.

### Relative articles

- http://www.idpf.org/epub/30/spec/epub30-publications.html#sec-item-property-values
- http://www.idpf.org/epub/20/spec/OPF_2.0.1_draft.htm
- http://www.aliciaramirez.com/2014/05/how-to-make-a-kindle-ebook-from-scratch/

### LICENSE

The MIT License (MIT)

Copyright (c) 2016 小胡子哥