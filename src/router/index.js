import Vue from 'vue'
import Router from 'vue-router'
import {store} from '@/store'

// Profile
const Profile = () => import('../components/Auth/Profile')
const Register = () => import('../components/Auth/Register')
const Login = () => import('../components/Auth/Login')
const NewPassword = () => import('../components/Auth/NewPassword')
const ResetPassword = () => import('../components/Auth/ResetPassword')
const AcceptJoin = () => import('../components/Shared/AcceptJoin')
const MaintenanceMode = () => import('../components/Auth/MaintenanceMode')

// Applications
const Applications = () => import('../components/Application/Applications')
const Dashboard = () => import('../components/Dashboard/Dashboard')
const ApplicationSettings = () => import('../components/Application/ApplicationSettings')

// Users
const UsersList = () => import('../components/User/UsersList')
const UserProfile = () => import('../components/User/UserProfile')

// Organisations
const Organisations = () => import('../components/Organisation/Organisations')
const ShowOrganisation = () => import('../components/Organisation/ShowOrganisation')

// FormTemplates
const FormTemplates = () => import('../components/Form/FormTemplates')
const ShowFormTemplate = () => import('../components/Form/ShowFormTemplate')

// Forms
const FormList = () => import('../components/Form/Form/FormList')
const FormItem = () => import('../components/Form/Form/FormItem')
const ReportBuilder = () => import('../components/Form/Form/ReportBuilder')
const CompareForms = () => import('../components/Form/Form/CompareForms')
const ChartBuilder = () => import('../components/Form/Form/ChartBuilder')

// Notes
const NotesPage = () => import('../components/Note/NotesPage')

// Workflows
const WorkflowList = () => import('../components/Workflow/WorkflowList')

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/maintenance',
      name: 'Maintenance',
      component: MaintenanceMode,
      props: true
    },
    {
      path: '/register',
      name: 'Register',
      component: Register
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/password/reset/:token',
      name: 'NewPassword',
      component: NewPassword,
      props: true
    },
    {
      path: '/password/reset',
      name: 'ResetPassword',
      component: ResetPassword,
      props: true
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile,
      meta: {requiresAuth: true}
    },
    {
      path: '/join/:type/:token',
      name: 'AcceptJoin',
      component: AcceptJoin,
      props: true,
      meta: {requiresAuth: true}
    },
    {
      path: '/applications',
      name: 'Applications',
      component: Applications,
      meta: {requiresAuth: true}
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,
      meta: {
        application: true,
        requiresAuth: true
      }
    },
    {
      path: '/organisations',
      name: 'Organisations',
      component: Organisations,
      meta: {
        application: true,
        requiresAuth: true
      }
    },
    {
      path: '/organisations/:id',
      name: 'ShowOrganisation',
      component: ShowOrganisation,
      props: true,
      meta: {
        application: true,
        requiresAuth: true
      }
    },
    {
      path: '/users',
      name: 'UsersList',
      component: UsersList,
      meta: {
        application: true,
        requiresAuth: true
      }
    },
    {
      path: '/users/:id',
      name: 'UserProfile',
      component: UserProfile,
      props: true,
      meta: {
        application: true,
        requiresAuth: true
      }
    },
    {
      path: '/form-templates',
      name: 'FormTemplates',
      component: FormTemplates,
      meta: {
        application: true,
        requiresAuth: true
      }
    },
    {
      path: '/form-templates/:id',
      name: 'ShowFormTemplate',
      component: ShowFormTemplate,
      props: true,
      meta: {
        application: true,
        requiresAuth: true
      }
    },
    {
      path: '/forms',
      name: 'FormList',
      component: FormList,
      meta: {
        application: true,
        requiresAuth: true
      }
    },
    {
      path: '/notes',
      name: 'Notes',
      component: NotesPage,
      meta: {
        application: true,
        requiresAuth: true
      }
    },
    {
      path: '/workflows',
      name: 'WorkflowList',
      component: WorkflowList,
      meta: {
        application: true,
        requiresAuth: true
      }
    },
    {
      path: '/settings',
      name: 'ApplicationSettings',
      component: ApplicationSettings,
      meta: {
        application: true,
        requiresAuth: true
      }
    },
    {
      path: '/forms/:id',
      name: 'FormItem',
      component: FormItem,
      props: true,
      meta: {
        application: true,
        requiresAuth: true
      }
    },
    {
      path: '/report',
      name: 'ReportBuilder',
      component: ReportBuilder,
      meta: {
        application: true,
        requiresAuth: true
      }
    },
    {
      path: '/compare',
      name: 'CompareForms',
      component: CompareForms,
      meta: {
        application: true,
        requiresAuth: true
      }
    },
    {
      path: '/chart',
      name: 'ChartBuilder',
      component: ChartBuilder,
      meta: {
        application: true,
        requiresAuth: true
      }
    },
    {
      path: '/auth/callback',
      component: {
        template: '<div class="auth-component"></div>'
      }
    },
    {
      path: '*',
      name: '404',
      component: Login
    }
  ],
  mode: 'history'
})

router.beforeEach((to, from, next) => {
  const slug = window.location.hostname.split('.')[0]
  store.dispatch('loadApplication', slug)
  .then(response => {
    return response
  })
  .catch(error => {
    // Get the error response || Set default error response
    const response = error && error.response ? error.response : { status: 503 }
    return response
  })
  .then(response => {
    const application = response && response.data && response.data.application ? response.data.application : {}
    if (to.fullPath === '/' || (to.name === 'Maintenance' && response.status !== 503)) {
      // Default Application Route || No Mainteiance
      router.push({ path: (application.default_route ? application.default_route : '/forms') })
    } else if (!store.getters.user && to.meta.requiresAuth) {
      // 401 Requires Auth
      router.push({ name: 'Login', query: { redirect: to.fullPath } })
    } else if (response && response.status === 503 && to.name !== 'Maintenance') {
      // 503 Maintenance
      const data = response && response.data ? response.data : {}
      router.push({ name: 'Maintenance', params: { data: data } })
    } else if (response.status === 404 && to.name !== 'Applications' && store.getters.user) {
      // 404 No Application with Auth
      router.push({ name: 'Applications', query: { application: false } })
    }

    return application
  })
  .then(application => {
    // Branding
    const favicon = document.getElementById('dyc-favicon')
    const style = document.getElementById('dyc-css')
    document.title = application.name || process.env.APP_NAME
    favicon.href = application.icon && JSON.parse(application.icon) ? JSON.parse(application.icon).url : '/static/icon.png'
    style.innerHTML = application.css || ''
    let backgroundImage = application.background_image && JSON.parse(application.background_image) ? JSON.parse(application.background_image).url : '/static/background.jpg'
    document.body.style.backgroundImage = !to.meta.requiresAuth ? 'url(' + backgroundImage + ')' : ''
  })
  .finally(() => {
    next()
  })
})

export default router
