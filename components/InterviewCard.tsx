import React from 'react'
import dayjs from 'dayjs';
import Image from 'next/image';
import { getRandomInterviewCover } from '@/lib/utils';
import Link from 'next/link';
import DisplayTechIcons from './DisplayTechIcons';

interface InterviewCardProps {
    interviewId?: string;
    id?: string;
    userId?: string;
    role: string;
    type: string;
    techstack: string[];
    createdAt: string | Date;
}

const InterviewCard = ({interviewId, id, userId, role, type, techstack, createdAt}: InterviewCardProps) => {
    const finalInterviewId = interviewId || id;
    const feedback: any = null;
    const normalizedType = /mix/gi.test(type) ? 'Mixed' : type;
    const formattedDate = dayjs(feedback?.createdAt || createdAt).format('DD/MM/YYYY');

  return (
   /* FIXED: Changed w-[360px] to w-full so it fits the grid */
   <div className="card-border w-full relative min-h-[380px]"> 
    <div className="card-interview">
        <div className="flex flex-col h-full">

            {/* Badge */}
            <div className='absolute top-4 right-4 w-fit px-4 py-2 rounded-lg bg-light-600 z-10'>
                <p className="badge-text">{normalizedType}</p>
            </div>

            {/* Top Info */}
            <Image src={getRandomInterviewCover()} alt="cover" width={90} height={90} className="rounded-full object-fit size-[90px]" />
            <h3 className="mt-5 capitalize font-semibold text-white">{role} Interview</h3>

            {/* Date and Score Row */}
            <div className="flex flex-row gap-5 mt-3 text-sm text-gray-400">
                <div className="flex flex-row gap-2 items-center">
                    <Image src="/calendar.svg" alt="calendar" width={18} height={18} />
                    <p>{formattedDate}</p>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <Image src="/star.svg" alt="star" width={18} height={18} />
                    <p>---/100</p>
                </div>
            </div>

            {/* Description */}
            <p className="line-clamp-3 mt-4 text-sm text-light-100 flex-grow">
                {"You haven't taken the interview yet. Take it now to improve your skills!"}
            </p>

            {/* Footer Row */}
            <div className="flex flex-row justify-between items-center mt-6">
                <DisplayTechIcons techStack={techstack} />
                <Link 
                    href={`/interview/${interviewId}`}
                    className="btn-primary px-4 py-2 rounded-md text-sm bg-indigo-600 text-white"
                >
                    View Interview
                </Link>
            </div>
        </div>
    </div>
   </div>
  )
}

export default InterviewCard