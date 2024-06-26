// ** Type import
import { VerticalNavItemsType, HorizontalNavItemsType } from 'src/@core/layouts/types'

export const VertivalNavigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Navigation',
      action: 'read',
      icon: 'tabler:navigation-pin',
      path: '/'
    },
    {
      title: 'Traffic Crashes',
      action: 'read',
      icon: 'fa-solid:car-crash',
      path: '/report/crashes'
    },
    {
      title: 'Speed Violations',
      action: 'read',
      icon: 'lets-icons:speed',
      path: '/report/speed'
    },
    {
      title: 'Red Light Violations',
      action: 'read',
      icon: 'mdi:traffic-light',
      path: '/report/redlight'
    }
  ]
}

export const HorizontalNavigation = (): HorizontalNavItemsType => {
  return [
    {
      title: 'Navigation',
      action: 'read',
      icon: 'tabler:navigation-pin',
      path: '/'
    },
    {
      title: 'Traffic Crashes',
      action: 'read',
      icon: 'fa-solid:car-crash',
      path: '/report/crashes'
    },
    {
      title: 'Speed Violations',
      action: 'read',
      icon: 'lets-icons:speed',
      path: '/report/speed'
    },
    {
      title: 'Red Light Violations',
      action: 'read',
      icon: 'mdi:traffic-light',
      path: '/report/redlight'
    }
  ]
}

