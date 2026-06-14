"use client";

import React, { useState } from "react";
import { Save, User, Shield, Bell, Key, MessageSquare, Mail } from "lucide-react";
import { AppLayout } from "@/components/templates/AppLayout/AppLayout";
import { Button } from "@/components/atoms/Button/Button";
import { InputField } from "@/components/atoms/InputField/InputField";

export default function SettingsPage() {
  const [profileName, setProfileName] = useState("Admin User");
  const [profileEmail, setProfileEmail] = useState("admin@harbor.com");
  const [slackWebhook, setSlackWebhook] = useState("https://hooks.slack.com/services/YOUR_WORKSPACE_ID/YOUR_CHANNEL_ID/YOUR_SECRET_TOKEN");
  const [defaultBranch, setDefaultBranch] = useState("main");
  const [notifySuccess, setNotifySuccess] = useState(true);
  const [notifyFailure, setNotifyFailure] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Settings saved successfully!");
  };

  return (
    <AppLayout searchPlaceholder="Search settings...">
      {/* Page Heading */}
      <div className="flex justify-between items-center mb-5 select-none animate-fade-in">
        <div>
          <h1 className="text-[22px] font-medium tracking-tight text-[#1a1a1a]">
            Settings
          </h1>
          <p className="text-sm text-[#6b5e52] mt-1">
            Configure integrations, notifications, and profile details.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          icon={<Save size={14} />}
          onClick={handleSave}
          className="cursor-pointer font-medium"
          width="w-auto"
        >
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 select-none animate-slide-up">
        {/* Left column: Profile & Security */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Profile Details */}
          <div className="bg-white border border-black/5 rounded-md p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-2 border-b border-black/5">
              <User size={16} className="text-[#d08873]" />
              <h2 className="text-sm font-semibold text-[#1a1a1a]">
                Profile Settings
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#8a7f75]">Full Name</label>
                <InputField
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="John Doe"
                  className="bg-[#fdfcf9] border-black/5 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#8a7f75]">Email Address</label>
                <InputField
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="colleague@harbor.com"
                  className="bg-[#fdfcf9] border-black/5 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Deploy defaults */}
          <div className="bg-white border border-black/5 rounded-md p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-2 border-b border-black/5">
              <Key size={16} className="text-[#d08873]" />
              <h2 className="text-sm font-semibold text-[#1a1a1a]">
                Deployment Configurations
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#8a7f75]">Default Repository Branch</label>
                <InputField
                  value={defaultBranch}
                  onChange={(e) => setDefaultBranch(e.target.value)}
                  placeholder="main"
                  className="bg-[#fdfcf9] border-black/5 text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#8a7f75]">Deployment Region</label>
                <div className="relative w-full">
                  <select
                    className="w-full appearance-none bg-[#fdfcf9] border border-black/5 text-sm text-[#2b2622] py-2 pl-3 pr-8 rounded-md focus:outline-none focus:border-[#d08873]/50 transition-colors duration-200 cursor-pointer h-[38px]"
                    defaultValue="us-east-1"
                  >
                    <option value="us-east-1">us-east-1 (N. Virginia)</option>
                    <option value="eu-west-1">eu-west-1 (Ireland)</option>
                    <option value="ap-south-1">ap-south-1 (Mumbai)</option>
                    <option value="ap-southeast-1">ap-southeast-1 (Singapore)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-[#8a7f75]">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Notification Integrations */}
        <div className="flex flex-col gap-5">
          {/* Notification settings */}
          <div className="bg-white border border-black/5 rounded-md p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-2 border-b border-black/5">
              <Bell size={16} className="text-[#d08873]" />
              <h2 className="text-sm font-semibold text-[#1a1a1a]">
                Notifications
              </h2>
            </div>

            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#1a1a1a]">Deployment Success alerts</span>
                  <span className="text-[11px] text-[#8a7f75]">Notify via webhook when builds succeed</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifySuccess}
                  onChange={(e) => setNotifySuccess(e.target.checked)}
                  className="w-4 h-4 rounded text-[#d08873] border-gray-300 focus:ring-[#d08873] accent-[#d08873]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#1a1a1a]">Deployment Failure alerts</span>
                  <span className="text-[11px] text-[#8a7f75]">Notify via webhook when builds fail</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyFailure}
                  onChange={(e) => setNotifyFailure(e.target.checked)}
                  className="w-4 h-4 rounded text-[#d08873] border-gray-300 focus:ring-[#d08873] accent-[#d08873]"
                />
              </div>
            </div>
          </div>

          {/* Webhook Integrations */}
          <div className="bg-white border border-black/5 rounded-md p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-2 border-b border-black/5">
              <MessageSquare size={16} className="text-[#d08873]" />
              <h2 className="text-sm font-semibold text-[#1a1a1a]">
                Slack Integration
              </h2>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#8a7f75]">Incoming Webhook URL</label>
              <InputField
                value={slackWebhook}
                onChange={(e) => setSlackWebhook(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                iconLeft={<MessageSquare size={14} className="text-[#8a7f75]" />}
                className="bg-[#fdfcf9] border-black/5 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
