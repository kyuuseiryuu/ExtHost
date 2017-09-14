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