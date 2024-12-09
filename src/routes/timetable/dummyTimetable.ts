
import {Timetable, Activity, Subject} from '../../models/Timetable'

export const data = {
    subjects: [
        {
          name: {
            shortName: "KČR",
            fullName: "Komunikacija Človek Računalnik"
          },
          color: "#cdc9e9",
          activities: [
            {
              activityType: "P",
              location: "P01",
              teacher: ["Luka Čehovin Zajc", "Ciril Bohak"],
              day: "TOR",
              hourStart: 13,
              hourEnd: 16
            },
            {
                activityType: "LV",
                location: "PR06",
                teacher: ["Luka Čehovin Zajc"],
                day: "ČET",
                hourStart: 15,
                hourEnd: 17
            },
            {
                activityType: "LV",
                location: "PR17",
                teacher: ["Luka Čehovin Zajc"],
                day: "PET",
                hourStart: 15,
                hourEnd: 17
            },
            {
                activityType: "LV",
                location: "PR08",
                teacher: ["Ciril Bohak"],
                day: "PON",
                hourStart: 7,
                hourEnd: 9
            },
            {
                activityType: "LV",
                location: "PR06",
                teacher: ["Ciril Bohak"],
                day: "PON",
                hourStart: 13,
                hourEnd: 15
            },
            {
                activityType: "LV",
                location: "PR11",
                teacher: ["Luka Čehovin Zajc"],
                day: "TOR",
                hourStart: 9,
                hourEnd: 11
            },
        ]
        },
        {
            name: {
              shortName: "P",
              fullName: "Funkcijsko Programiranje"
            },
            color: "#a5e9dd",
            activities: [
              /*{
                activityType: "P",
                location: "P01",
                teacher: ["Zoran Bosnić"],
                day: "SRE",
                hourStart: 7,
                hourEnd: 10
              },*/
              {
                activityType: "LV",
                location: "PR06",
                teacher: ["Klemen Klanjšček"],
                day: "TOR",
                hourStart: 9,
                hourEnd: 11
              },
              {
                  activityType: "LV",
                  location: "PR08",
                  teacher: ["Klemen Klanjšček"],
                  day: "ČET",
                  hourStart: 15,
                  hourEnd: 17
              },
              {
                  activityType: "LV",
                  location: "PR07",
                  teacher: ["Klemen Klanjšček"],
                  day: "ČET",
                  hourStart: 17,
                  hourEnd: 19
              },
              {
                  activityType: "LV",
                  location: "PR11",
                  teacher: ["Klemen Klanjšček"],
                  day: "PET",
                  hourStart: 8,
                  hourEnd: 10
              },
              {
                  activityType: "LV",
                  location: "PR08",
                  teacher: ["Klemen Klanjšček"],
                  day: "PET",
                  hourStart: 10,
                  hourEnd: 12
              },
          ]
        },
        {
            name: {
              shortName: "IVZ",
              fullName: "Informacijska Varnost in Zasebnost"
            },
            color: "#ffffc8",
            activities: [
              {
                activityType: "P",
                location: "P04",
                teacher: ["Denis Trček"],
                day: "PET",
                hourStart: 13,
                hourEnd: 16
              },
              {
                activityType: "LV",
                location: "PR16",
                teacher: ["David Jelenc"],
                day: "TOR",
                hourStart: 11,
                hourEnd: 13
              },
              {
                  activityType: "LV",
                  location: "PR10",
                  teacher: ["David Jelenc"],
                  day: "TOR",
                  hourStart: 15,
                  hourEnd: 17
              },
              {
                  activityType: "LV",
                  location: "PR15",
                  teacher: ["David Jelenc"],
                  day: "PET",
                  hourStart: 11,
                  hourEnd: 13
              }
          ]
        },
        {
            name: {
                shortName: "TEST",
                fullName: "Testiranje"
              },
              color: "#ffff38",
              activities: [
                {
                  activityType: "AV",
                  location: "P04",
                  teacher: ["Prosto prosto"],
                  day: "TOR",
                  hourStart: 13,
                  hourEnd: 15
                },
                {
                    activityType: "AV",
                    location: "P05",
                    teacher: ["Prosto prosto"],
                    day: "TOR",
                    hourStart: 14,
                    hourEnd: 16
                }
            ]
        }
    ]
}

function transformTimes(data: any): Timetable {
    // Helper function to get the base date of the week for a specific day
    function getBaseDate(day: string, weekStart: Date): Date {
      const daysOfWeek = ["PON", "TOR", "SRE", "ČET", "PET", "SOB", "NED"];
      const dayIndex = daysOfWeek.indexOf(day);
      if (dayIndex === -1) throw new Error(`Invalid day: ${day}`);
      return new Date(weekStart.getTime() + dayIndex * 24 * 60 * 60 * 1000);
    }
  
    // Generate all weekly occurrences within the date range
    function generateWeeklyOccurrences(
      activity: any,
      startDate: Date,
      endDate: Date
    ): Activity[] {
      const occurrences: Activity[] = [];
      let currentWeekStart = new Date(startDate);
  
      while (currentWeekStart <= endDate) {
        const baseDate = getBaseDate(activity.day, currentWeekStart);
        const dateFrom = new Date(baseDate);
        dateFrom.setHours(activity.hourStart, 0, 0, 0);
        const dateTo = new Date(baseDate);
        dateTo.setHours(activity.hourEnd, 0, 0, 0);
  
        // Push the occurrence
        occurrences.push({
          ...activity,
          dateFrom,
          dateTo,
        });
  
        // Move to the next week
        currentWeekStart = new Date(
          currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000
        );
      }
  
      return occurrences;
    }
  
    // Define the range
    const startDate = new Date('2024-10-01');
    const endDate = new Date('2025-01-17');
  
    // Transform the data
    return {
      subjects: data.subjects.map((subject: any) => ({
        name: subject.name,
        color: subject.color,
        activities: subject.activities.flatMap((activity: any) =>
          generateWeeklyOccurrences(activity, startDate, endDate)
        ),
      })),
    };
  }

export const dummyTimetable = transformTimes(data);