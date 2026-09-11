import { lazy, Suspense } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router-dom'

import { AppShell } from '@/components/layout/AppShell'
import { PageContainer } from '@/components/layout/PageContainer'
import { Skeleton, SkeletonRows } from '@/components/ui/Skeleton'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'

/* The public pair loads eagerly: Landing is the first paint and Login is one
   click away from it. Every in-app screen is split out. */
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Assistant = lazy(() => import('@/pages/Assistant'))
const Attendance = lazy(() => import('@/pages/Attendance'))
const Academics = lazy(() => import('@/pages/Academics'))
const Fees = lazy(() => import('@/pages/Fees'))
const Examinations = lazy(() => import('@/pages/Examinations'))
const Timetable = lazy(() => import('@/pages/Timetable'))
const Complaints = lazy(() => import('@/pages/Complaints'))
const ReportIssue = lazy(() => import('@/pages/ReportIssue'))
const ComplaintDetail = lazy(() => import('@/pages/ComplaintDetail'))
const Events = lazy(() => import('@/pages/Events'))
const Notifications = lazy(() => import('@/pages/Notifications'))
const Profile = lazy(() => import('@/pages/Profile'))
const Settings = lazy(() => import('@/pages/Settings'))

function RouteFallback() {
  return (
    <PageContainer>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-6 h-[196px] w-full rounded-card" />
      <div className="mt-4 rounded-card border border-line bg-surface p-5">
        <SkeletonRows count={4} />
      </div>
    </PageContainer>
  )
}

function lazyRoute(element: React.ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>
}

const routes: RouteObject[] = [
  /* Public marketing + auth surface — rendered outside the app shell. */
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },

  /* The signed-in workspace. */
  {
    path: '/app',
    element: <AppShell />,
    children: [
      { index: true, element: lazyRoute(<Dashboard />) },
      { path: 'assistant', element: lazyRoute(<Assistant />) },
      { path: 'attendance', element: lazyRoute(<Attendance />) },
      { path: 'academics', element: lazyRoute(<Academics />) },
      { path: 'exams', element: lazyRoute(<Examinations />) },
      { path: 'fees', element: lazyRoute(<Fees />) },
      { path: 'timetable', element: lazyRoute(<Timetable />) },
      { path: 'complaints', element: lazyRoute(<Complaints />) },
      { path: 'complaints/new', element: lazyRoute(<ReportIssue />) },
      { path: 'complaints/:id', element: lazyRoute(<ComplaintDetail />) },
      { path: 'events', element: lazyRoute(<Events />) },
      { path: 'notifications', element: lazyRoute(<Notifications />) },
      { path: 'profile', element: lazyRoute(<Profile />) },
      { path: 'settings', element: lazyRoute(<Settings />) },
      { path: '*', element: <NotFound /> },
    ],
  },

  { path: '*', element: <NotFound /> },
]

export const router = createBrowserRouter(routes)
