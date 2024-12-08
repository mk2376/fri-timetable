import { component$, useVisibleTask$ } from '@builder.io/qwik';
import {Timetable, Activity, Subject} from '../../models/Timetable'
import { dummyTimetable } from './dummyTimetable'; // Zacasni podatki 
import dayjs, { Dayjs } from 'dayjs';
import en from 'dayjs/locale/en';

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


  function groupByHourOverlap(day: Dayjs) {
    let groupedActivities: activityGroup[] = [];
    timetable.subjects.forEach((subject) => {
      subject.activities.forEach((activity) => {
        if (!dayjs(activity.dateFrom).isSame(day, 'day')) return;

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

    groupedActivities.sort((a, b) => dayjs(a.start).diff(dayjs(b.start)));

    const completeGroups: activityGroup[] = [];
    let currentTime = day.hour(7); 
    const endTime = day.hour(21); 

    for (const group of groupedActivities) {
        console.log(group)
        if (dayjs(group.start).isAfter(currentTime)) {
            completeGroups.push({
                activities: [],
                start: currentTime.toDate(),
                end: dayjs(group.start).toDate(),
            });
        }

        completeGroups.push(group);

        currentTime = dayjs(group.end);
    }

    if (currentTime.isBefore(endTime)) {
        completeGroups.push({
            activities: [],
            start: currentTime.toDate(),
            end: endTime.toDate(),
        });
    }

    return completeGroups;
  }

  const tday = dayjs(startOfWeek).day(3)
  const tue = groupByHourOverlap(tday);

  function findLargestGroupingActivityLength(groupings: any) {
    return groupings.reduce((largestActivityLength: any, group: any) => {
      return group.activities.length > largestActivityLength
        ? group.activities.length
        : largestActivityLength;
    }, 0);
  }

  const abc = findLargestGroupingActivityLength(tue)
  useVisibleTask$(() => {
    console.log(timetable);
    console.log(startOfWeek);
    console.log(endOfWeek);
    console.log(tue);
    console.log(abc);
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
          const dayGroupings = groupByHourOverlap(dayjs(startOfWeek).day(index + 2));
          const largestActivityLength = findLargestGroupingActivityLength(dayGroupings);
          console.log(dayGroupings)
          return (
            <div key={day} class="flex flex-col w-1/5 border border-gray-300">
              <div class="flex flex-row bg-gray-200 font-bold text-center border-b border-gray-300">
                {day}
              </div>
      
              <div class="flex flex-row w-full">
                {
                
                Array.from({length: largestActivityLength}, (_, i) => i).map((i) => {

                  return (
                    <div key={i} class="flex flex-col w-full">
                      {
                        dayGroupings.map((grouping) => {
                            let groupHours = Array.from({ length: grouping.end.getHours() - grouping.start.getHours()}, (_, i) => i + grouping.start.getHours());
                            return (
                              groupHours.map((hour) => {
                                const activity = i >= grouping.activities.length ? null : grouping.activities[i];
                                return (
                                  <>
                                  {
                                    (activity && activity.dateFrom.getHours() === hour)
                                    ?
                                    <div
                                      key={`${day}-${hour}`}
                                      class="flex flex-row w-full h-16 border-b border-gray-300 relative"
                                    >
                                      <div
                                        key={activity.dateFrom.toString()}
                                        class="flex flex-col w-full h-full bg-blue-100 rounded"
                                        style={{
                                          height: `${dayjs(activity.dateTo).diff(dayjs(activity.dateFrom), "hour") * 4}rem`,
                                        }}
                                      >
                                        <div class="font-medium">H</div>
                                        <div class="text-sm text-gray-700">
                                          {activity.activityType} - {activity.location}
                                        </div>
                                        <div class="text-sm text-gray-500">
                                          {dayjs(activity.dateFrom).format("HH:mm")} - {dayjs(activity.dateTo).format("HH:mm")}
                                        </div>
                                        <div class="text-sm italic text-gray-600">
                                          {activity.teacher.join(", ")}
                                        </div>
                                      </div>
                                    </div>
                                    :
                                    <div
                                      key={`${day}-${hour}`}
                                      class="flex flex-row w-full h-16 border-b border-gray-300 relative"
                                    >
                                    </div>
                                  }
                                  </>
                                );
                              })
                            )
                          })
                      }
                    </div>
                  )
                })
                /*
                dayGroupings.map((grouping) => {
                  let groupHours = Array.from({ length: grouping.end.getHours() - grouping.start.getHours()}, (_, i) => i + grouping.start.getHours());
                  console.log(groupHours)
                  return (
                    <div  key={`${day}-${grouping.start.toISOString()}-${grouping.end.toISOString()}`}
                      class="flex flex-col">
                      {
                      
                      }
                    </div>
                  );
                })
                */
                

                }
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
});