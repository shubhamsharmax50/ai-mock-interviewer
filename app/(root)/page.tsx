
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { dummyInterviews } from '@/constants'
import InterviewCard from '@/components/InterviewCard'
import { getCurrentUser, getInterviewsByUserId, getLatestInterviews } from '@/lib/actions/auth.action'

const page = async () => {
  const user =await getCurrentUser();

  const [userInterviews, latestInterviews] = await Promise.all([
    await getInterviewsByUserId(user?.id!),
    await getLatestInterviews({ userId: user?.id! }),
  ]);


  

  const hasPastInterviews = (userInterviews?.length ?? 0) > 0;
  const hasUpcomingInterviews= (latestInterviews?.length ?? 0) > 0;
  return (

    /* pt-2 reduces the gap between the logo and the hero card */
    <main className="flex min-h-screen flex-col items-center justify-start px-6 pt-2 pb-10 lg:px-20 lg:pt-4 gap-8">
      
      {/* HERO SECTION: py-6 makes it "thin" like the tutorial */}
      <section className="flex flex-col lg:flex-row items-center justify-between w-full max-w-6xl gap-10 bg-slate-900/50 py-6 px-10 lg:py-8 lg:px-12 rounded-3xl border border-white/10">
        
        {/* Left Side: Text Content */}
        <div className="flex flex-col gap-3 max-w-lg">
          <h2 className="text-2xl lg:text-3xl font-bold leading-tight text-white">
            Get Interview-Ready with AI-Powered Practice & Feedback
          </h2>
          <p className="text-sm lg:text-base text-gray-400">
            Practice on real interview questions & get instant feedback.
          </p>
          <Link 
            href="/interview" 
            className="w-fit px-6 py-2.5 bg-indigo-600 rounded-lg text-sm text-white font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            Start an Interview
          </Link>
        </div>

        {/* Right Side: Robot Image (Smaller size to keep the card sleek) */}
        <div className="relative">
          <Image 
            src="/robot.png" 
            alt="robot" 
            width={260} 
            height={260} 
            priority
            className="max-sm:hidden object-contain" 
          />
        </div>
      </section>

      {/* CONTENT WRAPPER: Fixed overlapping by adding 'gap-6' to the grid */}
      <div className="w-full max-w-6xl flex flex-col gap-12">
        
        {/* Your Interviews Section */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-semibold text-white">Your Interviews</h2>
          
          {/* GRID FIX: Ensure grid-cols and gap-6 are present to stop cards from touching */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {hasPastInterviews ? (
              userInterviews?.map((interview) => (
                 <InterviewCard  {...interview} key={interview.id}/>
              ))
            ) : (
              <p>You have&apos;t taken any interviews yet!</p>
            )
          }
          </div>
        </section>

        {/* Take an Interview Section */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-semibold text-white">Take an Interview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {hasUpcomingInterviews ? (
              latestInterviews?.map((interview) => (
                 <InterviewCard  {...interview} key={interview.id}/>
              ))
            ) : (
              <p>There are no upcoming interviews available.</p>
            )
          }
          </div>
        </section>
        
      </div>
    </main>
  )
}

export default page