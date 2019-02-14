import Vue from 'vue'
import Router from 'vue-router'

import Home from './views/Home'
// import LoginHtml from './views/loginHtml/LoginHtml'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      redirect: '/home/userManage'
    },
    {
      path: '*',
      redirect: '/'
    },
    {
      path: '/home',
      name: 'home',
      component: Home,
      children: [
        {
          path: 'userManage',
          name: 'userManage',
          component: () => import('./views/userManage/UserManage'),
        }
      ]
    },
  ]
})
