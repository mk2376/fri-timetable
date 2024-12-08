import { component$, useVisibleTask$ } from '@builder.io/qwik';
import {Timetable, Activity, Subject} from '../../models/Timetable'
import { dummyTimetable } from './dummyTimetable'; // Zacasni podatki 
import dayjs from 'dayjs';
import en from 'dayjs/locale/en';

dayjs.locale({
  ...en,
  weekStart: 1,
});

type activityGroup = {
  activities: Activity[],
  start: Date,
  end: Date,
}

export default component$(() => {

  let startOfWeek = dayjs(new Date()).startOf('week').toDate();
  let endOfWeek = dayjs(new Date()).endOf('week').toDate();
  
  // Zacasna funkcija za prikaz
  // To bo treba itak fetchati iz backenda/karkoli bo ze, teden za tednom.
  // Druga opcija je da imamo na voljo samo en teden in je dinamicen urnik sporočen pravočasno
  function getSelectedWeekTimetable(fullTimetable: Timetable, weekStart: Date, weekEnd: Date): Timetable {
    return {
      subjects: fullTimetable.subjects.map((subject) => {
        const filteredActivities = subject.activities.filter((activity) => {
          return (
            activity.dateFrom >= weekStart && activity.dateFrom <= weekEnd
          );
        });
  
        return {
          ...subject,
          activities: filteredActivities,
        };
      }).filter((subject) => subject.activities.length > 0)
    };
  }

  const days = ["Ponedeljek", "Torek", "Sreda", "Četrtek", "Petek"];
  const hours = Array.from({ length: 15 }, (_, i) => i + 7);
  const timetable = getSelectedWeekTimetable(dummyTimetable, startOfWeek, endOfWeek)


  function groupByHourOverlap(dayIndex: any) {
    let groupedActivities: activityGroup[] = [];
    timetable.subjects.forEach((subject) => {
      subject.activities.forEach((activity) => {
        const dayOfWeek =  dayjs(activity.dateFrom).day();
        if (dayOfWeek !== dayIndex) return;

        let existingGroup = groupedActivities.find((el) => dayjs(el.start).isBetween(activity.dateFrom, activity.dateTo, "hour", "[)") || dayjs(el.end).isBetween(activity.dateFrom, activity.dateTo, "hour", "()"));

        if (existingGroup) {
          existingGroup.activities.push(activity)
          existingGroup.start = dayjs(existingGroup.start).isBetween(activity.dateFrom, activity.dateTo, "hour", "()") ? activity.dateFrom : existingGroup.start
          existingGroup.end = dayjs(existingGroup.end).isBetween(activity.dateFrom, activity.dateTo, "hour", "()") ? activity.dateTo : existingGroup.end
        } else {
          const newActivityGroup: activityGroup = {
            activities: [activity],
            start: activity.dateFrom,
            end: activity.dateTo
          }
          groupedActivities.push(newActivityGroup);
        }
      });
    });
    return groupedActivities;
  }

  const tue = groupByHourOverlap(3);

  useVisibleTask$(() => {
    console.log(timetable);
    console.log(startOfWeek);
    console.log(endOfWeek);
    console.log(tue);
  });

  return (
    <>
      <div class="flex flex-row">
        <div class="flex flex-col">
          <div class="bg-gray-200 font-bold text-center border border-gray-300">
            Ura
          </div>
          {hours.map((hour) => (
            <div
              key={hour}
              class="flex h-16 border border-gray-300 bg-gray-100"
            >
              {`${hour}:00`}
            </div>
          ))}
        </div>
    
        {days.map((day, index) => {
          const groupedByOverlap = groupByHourOverlap(index+2);
          return (
            <div key={day} class="flex flex-col w-1/5 border border-gray-300">
              <div class="flex flex-row bg-gray-200 font-bold text-center border-b border-gray-300">
                {day}
              </div>
      
              {
              
              hours.map((hour) => (
                <div
                  key={`${day}-${hour}`}
                  class="flex flex-row h-16 border-b border-gray-300 relative"
                >
                  {timetable.subjects.map((subject) =>
                    subject.activities
                      .filter((activity) => {
                        const activityStart = dayjs(activity.dateFrom);
                        return (
                          activityStart.isSame(dayjs(startOfWeek).add(index + 1, "day"), "day") &&
                          activityStart.hour() === hour
                        );
                      })
                      .map((activity) => {
                        const startTime = dayjs(activity.dateFrom);
                        const endTime = dayjs(activity.dateTo);
                        const duration = endTime.diff(startTime, "hours");
      
                        return (
                          <div
                            key={activity.dateFrom.toString()}
                            class="flex flex-col w-full h-full bg-blue-100 rounded"
                            style={{
                              backgroundColor: `${subject.color}`,
                              height: `${duration * 4}rem`,
                            }}
                          >
                            <div class="font-medium">{subject.name.shortName}</div>
                            <div class="text-sm text-gray-700">
                              {activity.activityType} - {activity.location}
                            </div>
                            <div class="text-sm text-gray-500">
                              {startTime.format("HH:mm")} - {endTime.format("HH:mm")}
                            </div>
                            <div class="text-sm italic text-gray-600">
                              {activity.teacher.join(", ")}
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              ))

              }
            </div>
          );
        })}
      </div>
    </>
  );
});