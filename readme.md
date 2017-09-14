# ExtHost

一款在配置 hosts 文件的命令行工具 （暂只支持 *UNIX 平台)

## 理念

所有的配置都可以被管理起来，完全接管系统 host 配置。

## Quick Start

`npm i exthost`
`eh -h`
`eh init`

> 初始化一个 local 配置

## How to use

` eh a test -I=127.0.0.1 -H=localhost,www.foo.com,foo.com `  

> 创建一个名为 test 的 host 配置，并初始化一些信息

` eh c test -I=192.168.0.1 -H=gateway`

> test 配置文件中添加记录 `gateway` 指向 `192.168.0.1`

## Commands


```
Usage: eh [options]

Commands:
  a     (add) 创建一个空的 host 配置并追踪，更多额外参数可添加 -h 参数查看
  d     (delete) 删除一个 host 配置
  s     (show) 显示一个 host 的详细配置
  l     (list) 列出所有的 host 配置
  c     (choose) 选择一个 host 配置进行操作
  u     (use) 启用一个或者多个 host 配置
  init  初始化一些通用的默认配置
  i     (import) 导入一个 .json 配置
  e     (export) 导出所有配置到指定文件夹或用户文件夹
  
```
---