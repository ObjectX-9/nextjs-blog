#

## 🚀docker-compose自动化部署实践

相信有很多小伙伴有对 Docker 和 docker-compose 的部署有点疑惑，本文会以我自己的一个项目部署案例来讲述。

*这是我们的粗略架构*:

- ApiGateway也是用 Nestjs
- Nginx 做负载均衡
- 后端Services是用 Nestjs

![image](https://github.com/newObjectccc/newObjectccc.github.io/assets/42132586/602e3994-1e9a-4292-88d5-7de9bce4852b)

here we go！🚀

💡ps：以下是基于 `docker-compose` 哟，如果你没有 `docker` 和 `docker-compose` 的前置知识，请适当了解一下再看，不过相信我，就算你不熟悉，只要你会安装 `docker` 和 `docker-compose` 就可以，这部分不会请自行`google`。

我用`DevOps`平台是 **gitee**

`Docker`镜像源是 **阿里云**

记得在开始之前提前安装好你的 `docker` 和 `docker-compose`，甚至是你的 `git` 仓库，也请别忘记要打通 `gitee` 的话，记得去绑定远程实例哟~

### 正文开始👉

------------------------------------------------

这里给出项目的目录结构：

![image](https://github.com/newObjectccc/newObjectccc.github.io/assets/42132586/46e2d9d3-e0b2-461a-a124-a6883c4c9720)

#### 1. 首先在我们的后端项目根目录下创建 Dockerfile📌

配置好我们的 Dockerfile， 以便后续构建 image，配置比较简单我就不多赘述了。
💡*ps：注意是在子项目`kch-backend`根目录里配置哦*

```Dockerfile
FROM node:18

WORKDIR /app

COPY . .

USER root
RUN npm install -g pnpm
RUN pnpm install
RUN npm run build

EXPOSE 3000

CMD ["pnpm", "-F", "kch-backend", "start:prod"]
```

然后在 `Monorepo` 的根目录下创建 `docker-compose.yml` 文件，做如下配置：

```yaml
version: '3'
services:
  # 给你后端程序定义一个 service name 这个非常重要，后面我会说为什么
  cqbackend1:
    image: registry.cn-chengdu.aliyuncs.com/gitee-docker/cq-backend:latest
    ports:
      - '3000:3000'
    depends_on:
      - db
  # 给你后端程序定义一个 service name 这个非常重要，后面我会说为什么
  cqbackend2:
    image: registry.cn-chengdu.aliyuncs.com/gitee-docker/cq-backend:latest
    ports:
      - '3001:3001'
    depends_on:
      - db
  # 给你后端程序定义一个 service name 这个非常重要，后面我会说为什么
  cqbackend3:
    image: registry.cn-chengdu.aliyuncs.com/gitee-docker/cq-backend:latest
    ports:
      - '3002:3002'
    depends_on:
      - db
  # 给你后端程序定义一个 service name 这个非常重要，后面我会说为什么
  cqbackend4:
    image: registry.cn-chengdu.aliyuncs.com/gitee-docker/cq-backend:latest
    ports:
      - '3003:3003'
    depends_on:
      - db
  # 需要用到 nginx 做负载均衡
  nginx:
    image: nginx
    ports:
      - '81:81'
    # 将当前目录的 nginx.conf 配置文件绑定到镜像中的 /etc/nginx/nginx.conf 上
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    # 等所有项目都部署好了，再进行 nginx 部署
    depends_on:
      - cqapigateway
  cqapigateway:
    image: registry.cn-chengdu.aliyuncs.com/gitee-docker/cq-apigateway:latest
    ports:
      - '80:80'
    depends_on:
      - cqbackend1
      - cqbackend2
      - cqbackend3
      - cqbackend4
  db:
    image: mysql:latest
    environment:
      MYSQL_ROOT_PASSWORD: 123456
      MYSQL_DATABASE: kch_database
    volumes:
      - db-data:/var/lib/mysql
volumes:
  db-data:

```

因为用到了 nginx.conf 所以我们还需要在根目录下做如下 nginx 配置，这里各位请按需配置，我只给出的是默认配置：

```nginx
http {
  upstream app_servers {
    # 之前我说 service name 很重要，就是这里需要通过 name 来访问端口
    server cqbackend1:3000;
    # 之前我说 service name 很重要，就是这里需要通过 name 来访问端口
    server cqbackend1:3001;
    # 之前我说 service name 很重要，就是这里需要通过 name 来访问端口
    server cqbackend2:3002;
    # 之前我说 service name 很重要，就是这里需要通过 name 来访问端口
    server cqbackend3:3003;
  }

  server {
    listen 81;
    server_name rysyclub.com;

    location / {
      proxy_pass http://app_servers;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
    }
  }
}
```

💡*ps：注意之前我说 `service name` 很重要，就是这里需要通过 `name` 来访问端口，而不是localhost，这是因为 `docker` 有内建的 `network` 环境（这不是指你的服务器上的网络哟！），所以你要么配置网络link，要么部署在同一个网络下，事实上同一个 `docker-compose.yml` 文件中的 `services` 会部署在同一个 default 网络下，但是依然需要通过 `service name` 才能访问，否则会被拒绝访问，这个问题曾困扰我24小时，这就是不好好看文档的后果。😂（事实上不仅仅是 `nginx` 需要这样配置，你的服务器上的服务间不同端口需要互通也是同理，只要他们都是用 `docker`）比如我的 `apigateway` 服务内部是通过 `http://nginx:81` 访问 `Nginx` 的。*

okk~ 剩下的工作，你只需要配置好你的 `gitee` 流水线就可以了，这里给出一个简单的示例：

总体来说就是等待 `cqbackend` 和 `apigateway` 镜像打包完成之后再进行主机部署

![image](https://github.com/newObjectccc/newObjectccc.github.io/assets/42132586/57603283-cedd-4cba-9328-3f030eb6f02a)

💡*ps：如果你想用于生产环境，建议你用 `pipeline` 测试你的程序，通过之后再进行主机部署*

这是在流水线中 `主机部署` 里需要的 `bash`

```bash
# 进入到你的工作目录
cd ~/gitee_go/cq-backend
# 同步一下远程仓库的分支，这里我是同步的 feature，但通常是 release 分支才对
git fetch origin feature
# 拉取该分支下根目录的 docker-compose.yml
git checkout origin/feature -- docker-compose.yml
# 拉取该分支下根目录的 docker-compose.yml
git checkout origin/feature -- nginx.conf
# 先停掉当前的容器
docker-compose stop
# 删除 image，以便重新拉取最新的 image
docker rmi -f registry.cn-chengdu.aliyuncs.com/gitee-docker/cq-apigateway:latest
# 删除 image，以便重新拉取最新的 image
docker rmi -f registry.cn-chengdu.aliyuncs.com/gitee-docker/cq-backend:latest
# 后台启动~
docker-compose up -d --remove-orphans
```

💡*ps：请注意，以上 `git` 部分要生效需要你提前在你的工作目录中（`cd ~/gitee_go/cq-backend`）创建 `git` 仓库，checkout 2个部署文件就可以了，这样你的 `git` 仓库就只有这俩文件，而不是整个 `monorepo`*

建议你ssh到你的实例上去用 `docker ps` 验证一下，如果输出如下，那便没啥问题了：

![image](https://github.com/newObjectccc/newObjectccc.github.io/assets/42132586/32064f66-781b-4ed9-9698-9438f43549db)

💡*ps：这是一个入门示例，请别直接用到生产环境，你还需要做更多的容错和 `backup` 的方案，至少你的 `CI` 需要更多的测试相关 `pipeline` , `CD` 上你需要对每一个服务进行较为完善的监控，做好预警等措施，并且你的数据库也应该有备份机制等。*

------------------------------------------------

😊okk~ 这就是我的入门实践了，希望能帮助到你，赶紧去部署你的应用吧~
