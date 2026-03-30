'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Menu, X } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { cn } from '@/lib/utils'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring' as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

function DashboardMockup() {
    return (
        <div className="bg-[#F8F9FA] rounded-2xl p-4 md:p-6 w-full text-left select-none" style={{ fontSize: '0.7rem' }}>
            {/* Top bar */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded bg-[#2B5EA7] flex items-center justify-center">
                        <span className="text-white text-[6px] font-bold">S</span>
                    </div>
                    <span className="font-semibold text-[10px] text-black">Syllabi</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-4 w-20 rounded-full bg-white border border-[#E9ECEF]" />
                    <div className="h-5 w-5 rounded-full bg-[#2B5EA7]" />
                </div>
            </div>

            <div className="grid grid-cols-12 gap-3">
                {/* Sidebar */}
                <div className="col-span-2 space-y-2 hidden md:block">
                    {['Home', 'Schedule', 'Insights', 'Settings'].map((label) => (
                        <div key={label} className={`h-5 rounded-md px-2 flex items-center text-[8px] ${label === 'Home' ? 'bg-[#EFF6FF] text-[#2B5EA7] font-semibold' : 'text-[#6C757D]'}`}>
                            {label}
                        </div>
                    ))}
                    <div className="h-px bg-[#E9ECEF] my-2" />
                    <div className="text-[7px] font-bold text-[#ADB5BD] uppercase tracking-wider px-2">Courses</div>
                    {['CS 341', 'MATH 239', 'CS 350'].map((c) => (
                        <div key={c} className="h-4 rounded-md px-2 flex items-center text-[8px] text-[#6C757D]">{c}</div>
                    ))}
                </div>

                {/* Main content */}
                <div className="col-span-12 md:col-span-10 space-y-3">
                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white rounded-xl p-3 border border-[#E9ECEF]">
                            <p className="text-[7px] text-[#6C757D] uppercase font-bold">Current GPA</p>
                            <p className="text-lg font-bold text-[#2B5EA7] mt-0.5">87%</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-[#E9ECEF]">
                            <p className="text-[7px] text-[#6C757D] uppercase font-bold">Study Load</p>
                            <div className="flex items-end gap-1 mt-1">
                                {[40, 65, 80, 55, 70, 30, 45].map((h, i) => (
                                    <div key={i} className="flex-1 bg-[#2B5EA7] rounded-t" style={{ height: `${h * 0.25}px` }} />
                                ))}
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-[#E9ECEF]">
                            <p className="text-[7px] text-[#6C757D] uppercase font-bold">Pace</p>
                            <p className="text-[10px] font-semibold text-black mt-1">Balanced</p>
                            <div className="mt-1 h-1.5 w-full rounded-full bg-[#E9ECEF]">
                                <div className="h-full w-3/5 rounded-full bg-[#2B5EA7]" />
                            </div>
                        </div>
                    </div>

                    {/* Cards row */}
                    <div className="grid grid-cols-2 gap-2">
                        {/* Upcoming deadlines */}
                        <div className="bg-white rounded-xl p-3 border border-[#E9ECEF]">
                            <p className="text-[8px] font-bold text-black mb-2">Upcoming Deadlines</p>
                            {[
                                { name: 'A4 - Greedy Algorithms', course: 'CS 341', due: 'Tomorrow' },
                                { name: 'Problem Set 6', course: 'MATH 239', due: 'Wed' },
                                { name: 'Midterm Review', course: 'CS 350', due: 'Fri' },
                            ].map((item) => (
                                <div key={item.name} className="flex items-center gap-2 py-1.5 border-b border-[#E9ECEF] last:border-0">
                                    <div className="w-0.5 h-4 rounded-full bg-[#2B5EA7] shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[8px] font-semibold text-black truncate">{item.name}</p>
                                        <p className="text-[7px] text-[#6C757D]">{item.course}</p>
                                    </div>
                                    <span className="text-[7px] font-bold text-[#6C757D] shrink-0">{item.due}</span>
                                </div>
                            ))}
                        </div>

                        {/* Mini calendar */}
                        <div className="bg-white rounded-xl p-3 border border-[#E9ECEF]">
                            <p className="text-[8px] font-bold text-black mb-2">Study Sessions</p>
                            <div className="grid grid-cols-7 gap-1 text-center">
                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                                    <span key={`${d}-${i}`} className="text-[6px] font-bold text-[#ADB5BD]">{d}</span>
                                ))}
                                {Array.from({ length: 28 }, (_, i) => {
                                    const hasSession = [2, 4, 7, 9, 11, 14, 16, 18, 21, 23].includes(i)
                                    const isToday = i === 14
                                    return (
                                        <div
                                            key={i}
                                            className={`aspect-square rounded flex items-center justify-center text-[6px] ${
                                                isToday ? 'bg-[#2B5EA7] text-white font-bold' : hasSession ? 'text-black' : 'text-[#CED4DA]'
                                            }`}>
                                            {i + 1}
                                            {hasSession && !isToday && (
                                                <span className="absolute mt-2.5 w-0.5 h-0.5 rounded-full bg-[#2B5EA7]" />
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Term archive row */}
                    <div className="bg-white rounded-xl p-3 border border-[#E9ECEF]">
                        <p className="text-[8px] font-bold text-black mb-2">Term Archive</p>
                        <div className="flex gap-2">
                            {[
                                { season: 'Fall', year: "'24", courses: 5 },
                                { season: 'Winter', year: "'25", courses: 4, active: true },
                                { season: 'Spring', year: "'25", courses: 3 },
                            ].map((term) => (
                                <div
                                    key={term.season}
                                    className={`flex-1 rounded-lg p-2 text-center ${
                                        term.active ? 'bg-[#EFF6FF] border border-[#2B5EA7]/30' : 'bg-[#F8F9FA] border border-[#E9ECEF]'
                                    }`}>
                                    <p className={`text-[8px] font-bold ${term.active ? 'text-[#2B5EA7]' : 'text-black'}`}>
                                        {term.season} {term.year}
                                    </p>
                                    <p className="text-[6px] text-[#6C757D] mt-0.5">{term.courses} courses</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function HeroSection() {
    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden">
                <div
                    aria-hidden
                    className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block">
                    <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(215,60%,85%,.08)_0,hsla(215,60%,55%,.02)_50%,hsla(215,60%,45%,0)_80%)]" />
                    <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(215,60%,85%,.06)_0,hsla(215,60%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-[80rem] -translate-y-[350px] absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(215,60%,85%,.04)_0,hsla(215,60%,45%,.02)_80%,transparent_100%)]" />
                </div>
                <section>
                    <div className="relative pt-24 md:pt-36">
                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            delayChildren: 1,
                                        },
                                    },
                                },
                                item: {
                                    hidden: {
                                        opacity: 0,
                                        y: 20,
                                    },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            type: 'spring' as const,
                                            bounce: 0.3,
                                            duration: 2,
                                        },
                                    },
                                },
                            }}
                            className="absolute inset-0 -z-20">
                            <img
                                src="https://ik.imagekit.io/lrigu76hy/tailark/night-background.jpg?updatedAt=1745733451120"
                                alt="background"
                                className="absolute inset-x-0 top-56 -z-20 hidden lg:top-32 dark:block"
                                width="3276"
                                height="4095"
                            />
                        </AnimatedGroup>
                        <div aria-hidden className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]" />
                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>
                                    <Link
                                        href="/register"
                                        className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-black/5 transition-all duration-300 dark:border-t-white/5 dark:shadow-zinc-950">
                                        <span className="text-foreground text-sm">AI-Powered Study Planning</span>
                                        <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>
                                        <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                                            <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>

                                    <h1 className="mt-8 max-w-4xl mx-auto text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem] font-bold">
                                        Plan smarter.{' '}
                                        <span className="text-[#2B5EA7]">Study less.</span>{' '}
                                        Achieve more.
                                    </h1>
                                    <p className="mx-auto mt-8 max-w-2xl text-balance text-lg">
                                        Upload your syllabi and let AI build your personalized study schedule, track deadlines, and optimize your workload across all your courses.
                                    </p>
                                </AnimatedGroup>

                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                    className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row">
                                    <div className="bg-foreground/10 rounded-[14px] border p-0.5">
                                        <Link
                                            href="/register"
                                            className={cn(buttonVariants({ size: 'lg' }), 'rounded-xl px-5 text-base')}>
                                            <span className="text-nowrap">Start Planning for Free</span>
                                        </Link>
                                    </div>
                                    <Link
                                        href="/login"
                                        className={cn(buttonVariants({ variant: 'ghost', size: 'lg' }), 'rounded-xl px-5')}>
                                        <span className="text-nowrap">I have an account</span>
                                    </Link>
                                </AnimatedGroup>
                            </div>
                        </div>

                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.75,
                                        },
                                    },
                                },
                                ...transitionVariants,
                            }}>
                            <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
                                <div
                                    aria-hidden
                                    className="bg-gradient-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
                                />
                                <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border p-4 shadow-lg shadow-zinc-950/15 ring-1">
                                    <DashboardMockup />
                                </div>
                            </div>
                        </AnimatedGroup>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="bg-background py-16 md:py-32 scroll-mt-20">
                    <div className="mx-auto max-w-5xl px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold md:text-4xl">Everything you need to ace your semester</h2>
                            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">Built for students who want to work smarter, not harder.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: 'upload_file',
                                    title: 'Syllabus Import',
                                    desc: 'Upload your course syllabi as PDFs. Our AI extracts every deadline, weight, and assessment automatically.',
                                },
                                {
                                    icon: 'analytics',
                                    title: 'Grade Projections',
                                    desc: 'See real-time grade projections for every course. Know exactly what you need on each assessment to hit your targets.',
                                },
                                {
                                    icon: 'calendar_month',
                                    title: 'Smart Scheduling',
                                    desc: 'Visualize your entire semester at a glance. Track study sessions, deadlines, and workload balance across all courses.',
                                },
                            ].map((feature) => (
                                <div key={feature.title} className="rounded-2xl border bg-card p-8 transition-all hover:shadow-md">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f0fa]">
                                        <span className="material-symbols-outlined text-[#2B5EA7] !text-[24px]">{feature.icon}</span>
                                    </div>
                                    <h3 className="mt-5 text-lg font-bold">{feature.title}</h3>
                                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section id="how-it-works" className="bg-background pb-16 md:pb-32 scroll-mt-20">
                    <div className="mx-auto max-w-5xl px-6">
                        <h2 className="text-center text-3xl font-bold mb-12">How it works</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { step: '1', title: 'Add your courses', desc: 'Create a term and add your courses with their credit weights.' },
                                { step: '2', title: 'Upload syllabi', desc: 'Drop in your PDF syllabi and let AI extract all assessments and deadlines.' },
                                { step: '3', title: 'Stay on track', desc: 'Get a personalized dashboard with projections, schedules, and insights.' },
                            ].map((item) => (
                                <div key={item.step} className="flex flex-col items-center text-center">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2B5EA7] text-sm font-bold text-white">
                                        {item.step}
                                    </div>
                                    <h3 className="mt-4 text-base font-bold">{item.title}</h3>
                                    <p className="mt-2 text-sm text-muted-foreground max-w-xs">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-background pb-16 md:pb-32">
                    <div className="mx-auto max-w-5xl px-6">
                        <div className="rounded-2xl bg-primary p-12 text-center">
                            <h2 className="text-3xl font-bold text-primary-foreground">Ready to optimize your semester?</h2>
                            <p className="mt-3 text-sm text-primary-foreground/60 max-w-md mx-auto">
                                Join students who plan smarter and stress less. Free to use, no credit card required.
                            </p>
                            <Link
                                href="/register"
                                className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }), 'mt-8 rounded-xl px-8')}>
                                Get Started
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t py-8">
                    <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-1.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/syllabi-logo-cropped.png" alt="Syllabi" className="h-7 w-auto" />
                            <span className="text-sm font-semibold">Syllabi</span>
                        </div>
                        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Syllabi. Built for students, by students.</p>
                    </div>
                </footer>
            </main>
        </>
    )
}

const menuItems = [
    { name: 'Features', href: '#features' },
    { name: 'How it works', href: '#how-it-works' },
]

const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="fixed z-20 w-full px-2 group">
                <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12', isScrolled && 'bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5')}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between lg:w-auto">
                            <Link href="/" className="flex items-center gap-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/syllabi-logo-cropped.png" alt="Syllabi" className="h-10 w-auto" />
                                <span className="text-lg font-bold">Syllabi</span>
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                data-state={menuState ? 'active' : 'inactive'}
                                className="relative z-20 -m-2 inline-flex size-9 items-center justify-center rounded-full lg:hidden"
                                aria-label={menuState ? 'Close Menu' : 'Open Menu'}>
                                <div className="in-data-[state=active]:rotate-180 transition-transform duration-200">
                                    {menuState ? <X className="size-5" /> : <Menu className="size-5" />}
                                </div>
                            </button>
                        </div>

                        <div className="hidden w-full flex-wrap items-center justify-end space-y-8 p-6 lg:flex lg:w-fit lg:space-y-0 lg:bg-transparent lg:p-0 group-data-[state=active]:block group-data-[state=active]:lg:flex">
                            <div className="lg:pr-4">
                                <ul className="space-y-6 text-base lg:flex lg:gap-6 lg:space-y-0 lg:text-sm">
                                    {menuItems.map((item) => (
                                        <li key={item.name}>
                                            <a
                                                href={item.href}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                                <Link
                                    href="/login"
                                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
                                    <span>Log in</span>
                                </Link>
                                <Link
                                    href="/register"
                                    className={cn(buttonVariants({ size: 'sm' }))}>
                                    <span>Get Started</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
