export type Activity = {
    activityType: string
    location: string,
    teacher: string[],
    dateFrom: Date,
    dateTo: Date
}
  
export type Subject = {
    name: {
      shortName: string
      fullName: string
    },
    color: string,
    activities: Activity[]
}
  
export type Timetable = {
    subjects: Subject[]
};  
  