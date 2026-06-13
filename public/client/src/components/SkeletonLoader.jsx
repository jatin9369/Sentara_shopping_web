import React from 'react';

export const ProductSkeleton = () => {
  return (
    <div className="flex flex-col bg-white dark:bg-card-dark rounded-2xl border border-slate-200/40 dark:border-slate-800/40 overflow-hidden shadow-soft animate-pulse">
      {/* Image box placeholder */}
      <div className="aspect-square w-full bg-slate-200 dark:bg-slate-800/60 relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent animate-shimmer" />
      </div>

      {/* Meta placeholder */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Category/rating row */}
          <div className="flex justify-between items-center">
            <div className="h-3 bg-slate-200 dark:bg-slate-800 w-1/4 rounded" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 w-1/8 rounded" />
          </div>
          {/* Title lines */}
          <div className="h-4 bg-slate-200 dark:bg-slate-800 w-full rounded" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 w-2/3 rounded" />
        </div>

        {/* Price & button row */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800/50">
          <div className="space-y-1.5 w-1/3">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 w-full rounded" />
            <div className="h-2.5 bg-slate-200 dark:bg-slate-800 w-2/3 rounded" />
          </div>
          <div className="h-9 w-9 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const DetailSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto py-8 animate-pulse space-y-8">
      {/* Back button link placeholder */}
      <div className="h-4 bg-slate-200 dark:bg-slate-800 w-24 rounded" />

      {/* Main split details placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Left: Image placeholder */}
        <div className="aspect-square w-full bg-slate-200 dark:bg-slate-800/40 rounded-3xl" />
        
        {/* Right: Info placeholders */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 w-16 rounded-full" />
            <div className="h-8 bg-slate-200 dark:bg-slate-800 w-3/4 rounded" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 w-1/3 rounded" />
          </div>

          <div className="h-14 bg-slate-200 dark:bg-slate-800/40 rounded-2xl w-1/2" />

          <div className="space-y-2">
            <div className="h-3 bg-slate-200 dark:bg-slate-800 w-full rounded" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 w-full rounded" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 w-2/3 rounded" />
          </div>

          <div className="h-20 bg-slate-200 dark:bg-slate-800/20 rounded-2xl" />

          <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-24" />
            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
};
