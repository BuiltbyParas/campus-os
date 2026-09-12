import { useState } from 'react'
import {
  User,
  Shield,
  Key,
  Bell,
  Sliders,
  Mail,
  GraduationCap,
  MapPin,
  Pencil,
  Copy,
  Check,
  Smartphone,
  LogOut,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { useStore } from '@/app/store'
import { PageContainer } from '@/components/layout/PageContainer'
import { ToggleSwitch, Checkbox } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

export default function Profile() {
  const { student } = useStore()
  const [activeTab, setActiveTab] = useState<'about' | 'privacy' | 'account' | 'notifications'>('about')
  const [copiedEmail, setCopiedEmail] = useState(false)

  // Settings State
  const [showAttendance, setShowAttendance] = useState(true)
  const [showGrades, setShowGrades] = useState(false)
  const [showLocation, setShowLocation] = useState(true)
  const [twoFactor, setTwoFactor] = useState(true)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [classReminders, setClassReminders] = useState(true)

  const copyEmail = () => {
    navigator.clipboard.writeText(student.email)
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2000)
  }

  return (
    <PageContainer className="space-y-6">
      {/* ======================================================= PROFILE HEADER */}
      <div className="relative overflow-hidden rounded-[12px] border border-[rgba(99,102,241,0.15)] bg-gradient-to-r from-[#1a1f2e] to-[#252d3d] p-6 lg:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.20)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative group cursor-pointer">
              <div className="grid size-[80px] place-items-center rounded-full bg-[#6366f1] text-[28px] font-bold text-white border-4 border-[#1a1f2e] shadow-[0_0_16px_rgba(99,102,241,0.4)]">
                {student.initials}
              </div>
            </div>

            {/* User Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-[26px] font-bold text-white tracking-tight">{student.name}</h1>
                <span className="rounded-full bg-[#6366f1]/20 border border-[#6366f1]/30 px-3 py-0.5 text-[11px] font-bold text-[#6366f1] uppercase tracking-wider">
                  {student.program} • Sem {student.semester}
                </span>
              </div>
              <button
                onClick={copyEmail}
                className="flex items-center gap-1.5 text-[13px] text-[#a0aec0] hover:text-white transition-colors"
                title="Click to copy email"
              >
                <span>{student.email}</span>
                {copiedEmail ? <Check className="size-3.5 text-[#10b981]" /> : <Copy className="size-3.5 text-[#64748b]" />}
              </button>
              <p className="text-[12px] text-[#64748b]">
                Campus Roll No: {student.rollNumber} • Section {student.section}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/app/settings"
              className="inline-flex items-center gap-2 rounded-[8px] border border-[rgba(99,102,241,0.3)] bg-white/5 px-4 py-2 text-[13px] font-semibold text-white hover:bg-white/10 transition-all hover:scale-[1.02]"
            >
              <Pencil className="size-3.5" />
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* ======================================================= NAVIGATION TABS */}
      <div className="flex border-b border-[rgba(99,102,241,0.1)] gap-2 overflow-x-auto pb-px">
        {[
          { id: 'about', label: 'About & Info', icon: User },
          { id: 'privacy', label: 'Privacy & Sharing', icon: Shield },
          { id: 'account', label: 'Security & Access', icon: Key },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'flex items-center gap-2 border-b-2 px-4 py-3 text-[14px] font-semibold transition-all cursor-pointer whitespace-nowrap',
              activeTab === tab.id
                ? 'border-[#6366f1] text-[#6366f1]'
                : 'border-transparent text-[#a0aec0] hover:text-white'
            )}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ======================================================= TAB CONTENT PANELS */}
      <div className="rounded-[12px] border border-[rgba(99,102,241,0.15)] bg-[#1a1f2e] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <h3 className="text-[18px] font-bold text-white">Institutional Details</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Full Name</span>
                <p className="text-[15px] font-medium text-white">{student.name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Campus Email</span>
                <p className="text-[15px] font-medium text-white">{student.email}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Degree Programme</span>
                <p className="text-[15px] font-medium text-white">{student.program} (Bachelor of Computer Applications)</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Academic Term</span>
                <p className="text-[15px] font-medium text-white">Semester {student.semester} • Section {student.section}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Campus Residence</span>
                <p className="text-[15px] font-medium text-white">{student.hostel} • Room {student.room}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">University Registration</span>
                <p className="text-[15px] font-medium text-white">REG-{student.rollNumber}</p>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <h3 className="text-[18px] font-bold text-white">Data Privacy Controls</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <div>
                  <h4 className="text-[14px] font-semibold text-white">Share Attendance with Faculty Advisors</h4>
                  <p className="text-[12px] text-[#a0aec0]">Permits course mentors to review weekly progression</p>
                </div>
                <ToggleSwitch checked={showAttendance} onChange={setShowAttendance} />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <div>
                  <h4 className="text-[14px] font-semibold text-white">Public Peer Ranking on Leaderboards</h4>
                  <p className="text-[12px] text-[#a0aec0]">Display aggregate marks in batch standings</p>
                </div>
                <ToggleSwitch checked={showGrades} onChange={setShowGrades} />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <h4 className="text-[14px] font-semibold text-white">Hostel Wi-Fi Location Presence</h4>
                  <p className="text-[12px] text-[#a0aec0]">Facilitates automated presence verification during roll call</p>
                </div>
                <ToggleSwitch checked={showLocation} onChange={setShowLocation} />
              </div>
            </div>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <h3 className="text-[18px] font-bold text-white">Security & Active Sessions</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <div>
                  <h4 className="text-[14px] font-semibold text-white">Two-Factor Authentication</h4>
                  <p className="text-[12px] text-[#a0aec0]">Require one-time verification passcode upon new device login</p>
                </div>
                <ToggleSwitch checked={twoFactor} onChange={setTwoFactor} />
              </div>

              <div className="pt-2">
                <h4 className="text-[14px] font-semibold text-white mb-3">Recognized Sessions</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-[8px] bg-white/[0.03] p-3 border border-white/5">
                    <div className="flex items-center gap-3">
                      <Smartphone className="size-5 text-[#6366f1]" />
                      <div>
                        <div className="text-[13px] font-medium text-white">Linux Workstation • Chrome</div>
                        <div className="text-[11px] text-[#64748b]">Active Now • Jalandhar, IN</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded">
                      Current
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-[18px] font-bold text-white">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <div>
                  <h4 className="text-[14px] font-semibold text-white">Immediate Class Reminders</h4>
                  <p className="text-[12px] text-[#a0aec0]">Trigger alerts 15 minutes before lectures commence</p>
                </div>
                <ToggleSwitch checked={classReminders} onChange={setClassReminders} />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <h4 className="text-[14px] font-semibold text-white">Daily Digest Summaries</h4>
                  <p className="text-[12px] text-[#a0aec0]">Receive daily email rundown of attendance & deadlines</p>
                </div>
                <ToggleSwitch checked={emailAlerts} onChange={setEmailAlerts} />
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  )
}
