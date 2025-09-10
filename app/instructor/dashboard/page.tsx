'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function InstructorDashboard() {
  // Demo data - in real app this would come from API
  const instructorData = {
    name: 'Maria Rodriguez',
    stats: {
      totalClasses: 8,
      studentsEnrolled: 156,
      upcomingThisWeek: 12,
      monthlyEarnings: 3420.00,
      averageRating: 4.8
    },
    todaysClasses: [
      {
        id: '1',
        title: 'Beginner Salsa',
        time: '18:00',
        duration: 60,
        enrolled: 12,
        capacity: 15,
        venue: 'Studio A'
      },
      {
        id: '2',
        title: 'Intermediate Bachata',
        time: '19:30',
        duration: 75,
        enrolled: 8,
        capacity: 12,
        venue: 'Studio B'
      }
    ],
    recentActivity: [
      { id: '1', message: 'New student enrolled in Advanced Tango', time: '2 hours ago' },
      { id: '2', message: 'Sarah M. completed Beginner Salsa series', time: '1 day ago' },
      { id: '3', message: 'Payment received for December classes', time: '2 days ago' },
      { id: '4', message: 'New message from Alex T.', time: '3 days ago' }
    ]
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {instructorData.name}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your classes today
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-2xl">📚</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Classes</p>
              <p className="text-2xl font-bold text-gray-900">{instructorData.stats.totalClasses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Students Enrolled</p>
              <p className="text-2xl font-bold text-gray-900">{instructorData.stats.studentsEnrolled}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-full">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">{instructorData.stats.upcomingThisWeek}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">${instructorData.stats.monthlyEarnings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">{instructorData.stats.averageRating}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Classes */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Today's Schedule</h2>
            </div>
            
            {instructorData.todaysClasses.length === 0 ? (
              <div className="p-6 text-center">
                <span className="text-4xl mb-4 block">🎉</span>
                <p className="text-gray-600 mb-4">No classes scheduled for today</p>
                <p className="text-sm text-gray-500">Enjoy your day off!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {instructorData.todaysClasses.map((cls) => (
                  <div key={cls.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {cls.title}
                          </h3>
                          <span className="ml-3 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {cls.venue}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <span className="mr-1">🕐</span>
                            <span>{cls.time} ({cls.duration} min)</span>
                          </div>
                          
                          <div className="flex items-center">
                            <span className="mr-1">👥</span>
                            <span>{cls.enrolled}/{cls.capacity} students</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-6 flex space-x-2">
                        <button className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200">
                          Attendance
                        </button>
                        <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                          Details
                        </button>
                      </div>
                    </div>
                    
                    {/* Progress bar for enrollment */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{width: `${(cls.enrolled / cls.capacity) * 100}%`}}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {cls.capacity - cls.enrolled} spots remaining
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-4 space-y-3">
              <Link 
                href="/instructor/messages"
                className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
              >
                <span className="text-lg mr-3">💬</span>
                <div>
                  <p className="font-medium text-purple-900">Send Message</p>
                  <p className="text-xs text-purple-700">Message students or class</p>
                </div>
              </Link>
              
              <Link 
                href="/instructor/classes"
                className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
              >
                <span className="text-lg mr-3">📚</span>
                <div>
                  <p className="font-medium text-blue-900">Manage Classes</p>
                  <p className="text-xs text-blue-700">View all your classes</p>
                </div>
              </Link>
              
              <Link 
                href="/instructor/students"
                className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition"
              >
                <span className="text-lg mr-3">👥</span>
                <div>
                  <p className="font-medium text-green-900">View Students</p>
                  <p className="text-xs text-green-700">See enrolled students</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {instructorData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">This Month</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Classes Taught</span>
                <span className="font-semibold text-gray-900">32</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New Students</span>
                <span className="font-semibold text-green-600">+12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Attendance Rate</span>
                <span className="font-semibold text-blue-600">94%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Messages Sent</span>
                <span className="font-semibold text-purple-600">28</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
