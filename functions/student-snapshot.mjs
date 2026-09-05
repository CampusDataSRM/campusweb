const keepCachedListWhenLiveIsEmpty = (liveValue, cachedValue) => {
  if (Array.isArray(liveValue) && liveValue.length > 0) return liveValue;
  return Array.isArray(cachedValue) ? cachedValue : [];
};

export const mergeStudentSnapshot = (live, cached = {}) => {
  if (!live || typeof live !== "object" || Array.isArray(live)) return cached;
  return {
    ...cached,
    ...live,
    courses: keepCachedListWhenLiveIsEmpty(live.courses, cached.courses),
    testPerformances: keepCachedListWhenLiveIsEmpty(
      live.testPerformances,
      cached.testPerformances,
    ),
  };
};
