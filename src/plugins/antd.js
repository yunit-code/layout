// 按需加载 ant-design-vue
// 手动删除没用用过的组件
import Vue from 'vue';
import 'ant-design-vue/lib/button/style/css';
import 'ant-design-vue/lib/icon/style/css';
import {
  Button,
  Icon
} from 'ant-design-vue';
import Base from 'ant-design-vue/lib/base/index.js'

/* v1.1.3+ registration methods */
Vue.use(Button);
Vue.use(Base);
Vue.use(Icon);