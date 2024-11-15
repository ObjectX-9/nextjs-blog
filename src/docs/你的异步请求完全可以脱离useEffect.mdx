#

## 🚀你的异步请求完全可以脱离useEffect

相信有很多小伙伴有对 React 中的 useEffect 严格模式下的行为感到很奇怪，普遍用它来模拟 React 函数式组件的生命周期，而把 Class Component 直接弃用了。

可又有很多场景需要发送请求，却不得不使用 useEffect，但是你真的需要吗？

here we go！🚀

ps：以下是基于 axios 哟~

### 正文开始👉

------------------------------------------------

📢首先我们需要明确我们的 useAxios 需要有哪些功能？

1. **请求的 pending 状态，也就是 loading 的状态处理。**
2. **请求的 resolve 处理，也就是接口正确返回的状态处理。**
3. **请求的 reject 处理，也就是接口的拒绝状态处理。**
4. **请求的 error catch 处理，也就是发生意外错误的情况处理。**
5. **当数据正确返回后，还可能涉及到更新的操作，比如给数据加isCheck、disabled、等等的前端状态字段。**
6. **请求需要可重发。**
7. **请求需要可中断。**

*这种多状态的频繁更新场景，我推荐使用 useReducer，它在细粒度更新上比 useState 更好。*

okk，下面我们一步一步来实现吧~

在下面代码里，请按 1 ~ 7 点对应来看吧~

#### cancelController 的封装🔖

需要提前介绍一下cancelController的单独封装，因为下面取消请求时会用到

*以下所有代码块只有这里的代码并不在 useAxios.js 文件内*

```javascript
// http
import Axios from 'axios';
const CancelToken = Axios.CancelToken;
export const getCancelCtx = () => CancelToken.source();
```

#### 这里还有一些预设代码🏷️

这里为了方便调用 dispatch，这里定义一下提交状态的类型

```javascript
// 首先定义一下几个状态的 dispatch 类型
const ACTION_TYPE = {
  LOADING: 'loading',
  ERROR: 'error',
  DATA: 'data'
};
```

接着定义自己的 reducer，进行管理状态

```javascript
const reducer = (state, action) => {
  let mergedState = { ...state };
  switch (action.type) {
    // loading 状态更新提交
    case ACTION_TYPE.LOADING:
      mergedState.loading = action.value;
      break;
    // error 状态更新提交
    case ACTION_TYPE.ERROR:
      mergedState.error = action.value;
      break;
    // data 状态更新提交
    case ACTION_TYPE.DATA:
      mergedState.data = action.value;
      break;
    default:
      break;
  }
  return mergedState;
};
```

#### 1. 请求的 pending 状态处理📌

```javascript
// 开始请求
dispatch({ type: ACTION_TYPE.LOADING, value: true });
// 结束请求
dispatch({ type: ACTION_TYPE.LOADING, value: false });
// reducer 管理
const reducer = (state, action) => {
  let mergedState = { ...state };
  switch (action.type) {
    case ACTION_TYPE.LOADING:
      mergedState.loading = action.value;
      break;
    default:
      break;
  }
  return mergedState;
};
```

#### 2. 请求的 resolve 状态处理以及 3. 请求的 reject 处理📌

```javascript
// 假如你的业务 code === '000' 时代表数据成功返回
if (res.data?.code === '000')
  // 既然成功返回了，那么就提交 data 的状态，并 return 出函数
  return dispatch({ type: ACTION_TYPE.DATA, value: res.data?.data })
/**
 * 如果没有拿到 '000' 的正确业务代码，则统一提交 error 状态，
 * 其实这里不仅仅有业务错误，还有前端错误也承载了，后面你就会看到。
 *  */
dispatch({ type: ACTION_TYPE.ERROR, value: res });
// reducer 管理
const reducer = (state, action) => {
  let mergedState = { ...state };
  switch (action.type) {
    case ACTION_TYPE.DATA:
      mergedState.data = action.value;
      break;
    case ACTION_TYPE.ERROR:
      mergedState.error = action.value;
      break;
    default:
      break;
  }
  return mergedState;
};
```

#### 4. 请求的 error catch 处理📌

```javascript
try {
  // code...
} catch (err) {
  /**
   * 注意这里的赋值操作就可以了
   * 若有意外错误，赋值给 res
   *  */ 
  res = err.response?.data ?? err;
}
// 这里是和业务错误一起，统一提交 error 状态
dispatch({ type: ACTION_TYPE.ERROR, value: res });
```

#### 5. 当数据正确返回后，还可能涉及到更新的操作📌

```javascript
// 只需要在 useAxios 中返回更新函数
return {
  update: (val) => dispatch({ type: ACTION_TYPE.DATA, value: val })
};
```

#### 6. 请求需要可重发📌

```javascript
// 只需要在 useAxios 中返回请求函数
return {
  request: (orParams) => httpReq(orParams),
};
```

#### 7. 请求需要可中断📌

```javascript
// 我们只需要用一个 useRef 保存 cancelController
const cancelCtx = useRef(null)
/**
 * 这一段是在发情请求 httpReq 的 try {} catch 中，
 * 因为你需要按照 axios 文档的要求，注入 cancel，
 * 我们把 cancelController 赋值给我们的 cancelCtx 即可按需调用了。
 *  */ 
const ctl = getCancelCtx()
cancelCtx.current = ctl
if (params) options = {
  cancelToken: ctl.token,
  ...options,
  ...normalizedParamsByMethod(options.method, params)
};
res = await axios.request(options);
// 在 useAxios 中返回 cancel 函数
return {
  cancel: (msg) => cancelCtx.current?.cancel(msg)
};
```

--------------------------------------------------------

这里是完整代码

```javascript
// useAxios.js
import axios, { getCancelCtx } from 'http';
import { useMemo, useReducer, useRef } from 'react';

const ACTION_TYPE = {
  LOADING: 'loading',
  ERROR: 'error',
  DATA: 'data'
};

const reducer = (state, action) => {
  let mergedState = { ...state };
  switch (action.type) {
    case ACTION_TYPE.LOADING:
      mergedState.loading = action.value;
      break;
    case ACTION_TYPE.ERROR:
      mergedState.error = action.value;
      break;
    case ACTION_TYPE.DATA:
      mergedState.data = action.value;
      break;
    default:
      break;
  }
  return mergedState;
};

// useAxios 主体函数
export const useAxios = (options) => {
  const [state, dispatch] = useReducer(reducer, { error: null, loading: false, data: null });
  const cancelCtx = useRef(null)

  // 请求的具体方法，注意一下状态的流转
  const httpReq = async (params) => {
    let res = null;
    // 提交 loading = true 的状态
    dispatch({ type: ACTION_TYPE.LOADING, value: true });
    // 用 try 发起请求
    try {
      // 获取 cancel 控制器
      const ctl = getCancelCtx()
      cancelCtx.current = ctl
      if (params) options = {
        cancelToken: ctl.token,
        ...options,
        ...normalizedParamsByMethod(options.method, params)
      };
      res = await axios.request(options);
    } catch (err) {
      // 若有意外错误，赋值给 res
      res = err.response?.data ?? err;
    }
    // 请求完毕提交 loading = false 的状态
    dispatch({ type: ACTION_TYPE.LOADING, value: false });
    // 假如你的业务 code === '000' 时代表数据成功返回
    if (res.data?.code === '000')
      // 既然成功返回了，那么就提交 data 的状态，并 return 出函数
      return dispatch({ type: ACTION_TYPE.DATA, value: res.data?.data })
    // 如果没有拿到 '000' 的正确业务代码，则统一提交 error 状态
    dispatch({ type: ACTION_TYPE.ERROR, value: res });
  };

  return {
    ...state,
    request: (orParams) => httpReq(orParams),
    update: (val) => dispatch({ type: ACTION_TYPE.DATA, value: val }),
    cancel: (msg) => cancelCtx.current?.cancel(msg)
  };
};

/**
 * 利用高阶函数简单实现一个工厂模式的 useAxios，
 * 可以注意一下这里使用了 useMemo 来做优化，这很有必要，
 * 因为你使用的时候，useAxios 可能会因为其他并不相关的 state 更新而更新，我们应该避免这种情况
 *  */ 
export const generateAxiosHook =
  (method, url, options = {}) =>
  (params) => {
    const allOpts = useMemo(() => {
      const normalized = { method, url, ...options };
      normalizedParamsByMethod(method, params);
      return normalized;
    }, [params]);
    return useAxios(allOpts);
  };

// 只是为了抹平调用 axios.http 发起请求时，post 和 get 传参的差异，开发中往往还有更复杂的需求。
const normalizedParamsByMethod = (method, params) => {
  let normalized = {};
  if (method === 'get') normalized.params = params;
  if (method === 'post') normalized.data = params;
  return normalized;
};

```

------------------------------------------------

😊okk~ 赶紧去开发你的useAxios吧~
