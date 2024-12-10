import { component$, useVisibleTask$, useSignal } from '@builder.io/qwik';
import {Timetable, Activity} from '../../models/Timetable'
import { dummyTimetable } from './dummyTimetable'; // Zacasni podatki 
import dayjs from "../../lib/dayjsConfig"
import { Dayjs } from 'dayjs';

type timetableProps = {
  daysData: activityGroup[][],
  possibleDays: string[]
}

type timetableColumnProps = {
  dayData: activityGroup[],
  day: string,
  dayIndex: number
}

type activityGroup = {
  activities: ActivityDisplay[],
  start: Date,
  end: Date,
}

interface ActivityDisplay extends Activity {
  col: number,
  color: string,
  fullName: string,
  shortName: string,
}

export const DesktopTimetable = component$((props: timetableProps) => {

  const days = props.possibleDays;
  const hours = Array.from({ length: 15 }, (_, i) => i + 7);

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
          const dayGroupings = props.daysData[index];
          return (
            <div key={day} class="flex flex-col w-1/5 border border-gray-300">
              <div class="flex flex-row bg-gray-200 font-bold text-center border-b border-gray-300">
                {day}
              </div>
      
              <div class="flex flex-row w-full">
                <div class="flex flex-col w-full">
                  <TimetableColumn dayData={dayGroupings} day={day} dayIndex={index}/>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
});

const TimetableColumn = component$((props: timetableColumnProps) => {
  const day = props.day
  return (
    <>
    {
      props.dayData.map((grouping) => {
        const groupHours = Array.from({ length: grouping.end.getHours() - grouping.start.getHours()}, (_, i) => i + grouping.start.getHours());
        const maxActivityCol = grouping.activities.reduce((acc, el) => (!acc || el.col > acc) ? el.col : acc, 0);
        return (
          <div key={`${day}-${grouping.start}-${grouping.end}`} class="flex flex-row">
            {
              Array.from({length: maxActivityCol + 1}, (_, i) => i).map((i) => {
                return (
                  <div key={i} class="flex flex-col w-full">
                    {
                      groupHours.map((hour) => {
                        const activity = grouping.activities.find((activity) => (activity.dateFrom.getHours() == hour && activity.col == i));
                        return (
                          <>
                          {
                            activity
                            ?
                            <div
                              key={`${day}-${hour}`}
                              class="flex flex-row w-full h-16 border-b border-gray-300 relative"
                            >
                              <div
                                key={activity.dateFrom.toString()}
                                class="flex flex-col w-full h-full bg-blue-100 rounded"
                                style={{
                                  backgroundColor: `${activity.color}`,
                                  height: `${dayjs(activity.dateTo).diff(dayjs(activity.dateFrom), "hour") * 4}rem`,
                                }}
                              >
                                <div class="font-medium">{activity.shortName}</div>
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
                    }
                  </div>
                );
              })
            }
          </div>
        )
      })
    }
    </>
  );
})

export const MobileTimetable = component$((props: timetableProps) => {
  const selectedDay = "Torek";
  
  const days = props.possibleDays;
  const hours = Array.from({ length: 15 }, (_, i) => i + 7);

  const selectedDayIndex = days.findIndex((el) => el == selectedDay);

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
        
        <div class="flex flex-col w-full border border-gray-300">
          
          <div class="flex flex-row bg-gray-200 font-bold text-center border-b border-gray-300">
            {
              days.map((day, index) => {

                return (
                  index < selectedDayIndex
                  ?
                    <div class="flex flex-col">
                      {day}
                    </div>
                  :
                  <>
                  </>
                );
              })
            }
            <div class="flex flex-col w-1/2">
              {days[selectedDayIndex]}
            </div>
            {
            days.map((day, index) => {

              return (
                index > selectedDayIndex
                ?
                  <div class="flex flex-col">
                    {day}
                  </div>
                :
                <>
                </>
              );
            })
          }
          </div>
  
         

          <div class="flex flex-row w-full">
            <div class="flex flex-col w-full">
                <TimetableColumn dayData={props.daysData[selectedDayIndex]} day={days[selectedDayIndex]} dayIndex={selectedDayIndex}/>
            </div>
          </div>
        </div>

      </div>
    </>
  );
})

export default component$(() => {
  const startOfWeek = dayjs(new Date()).startOf('week').toDate();
  const endOfWeek = dayjs(new Date()).endOf('week').toDate();
  
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

  const timetable = getSelectedWeekTimetable(dummyTimetable, startOfWeek, endOfWeek)

  function groupByHourOverlap(day: Dayjs) {
    const groupedActivities: activityGroup[] = [];
    timetable.subjects.forEach((subject) => {
      subject.activities.forEach((activity) => {
        if (!dayjs(activity.dateFrom).isSame(day, 'day')) return;

        const existingGroup = groupedActivities.find((el) => dayjs(activity.dateFrom).isBetween(el.start, el.end, "hour", "[)") || dayjs(activity.dateTo).isBetween(el.start, el.end, "hour", "(]"));
        
        const activityDisplay: ActivityDisplay = {
          ...activity,
          col: 0,
          color: subject.color,
          fullName: subject.name.fullName,
          shortName: subject.name.shortName
        }

        if (existingGroup) {
          const takenCols = new Set(
            existingGroup.activities
              .filter(
                (act) =>
                  dayjs(activity.dateFrom).isBetween(act.dateFrom, act.dateTo, 'hour', '[)') ||
                  dayjs(activity.dateTo).isBetween(act.dateFrom, act.dateTo, 'hour', '()')
              )
              .map((act) => act.col)
          );
  
          let col = 0;
          while (takenCols.has(col)) {
            col++;
          }

          activityDisplay.col = col;

          existingGroup.activities.push(activityDisplay)
          existingGroup.start = dayjs(existingGroup.start).isBetween(activity.dateFrom, activity.dateTo, "hour", "()") ? activity.dateFrom : existingGroup.start
          existingGroup.end = dayjs(existingGroup.end).isBetween(activity.dateFrom, activity.dateTo, "hour", "()") ? activity.dateTo : existingGroup.end
        } else {
          const newActivityGroup: activityGroup = {
            activities: [activityDisplay],
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

  function getScheduleGroupingForEachDay(startOfWeek: Date) {
    const groupingPerDay: activityGroup[][] = [];
    for(let i = 2; i < 7; i++) {
      groupingPerDay.push(groupByHourOverlap(dayjs(startOfWeek).day(i)));
    }
    return groupingPerDay;
  }

  const isMobile = useSignal(false);

  const dayScheduleGroup = getScheduleGroupingForEachDay(startOfWeek);
  useVisibleTask$(() => {
    console.log(dayScheduleGroup);
    const updateScreenWidth = () => {
      isMobile.value = window.innerWidth <= 768;
    };
    updateScreenWidth();
    window.addEventListener('resize', updateScreenWidth);
    return () => window.removeEventListener('resize', updateScreenWidth);
  });

  const days = ["Ponedeljek", "Torek", "Sreda", "Četrtek", "Petek"]

  return (
    <>
      {isMobile.value ? (
        <MobileTimetable daysData={dayScheduleGroup} possibleDays={days}/>
      ) : (
        <DesktopTimetable daysData={dayScheduleGroup} possibleDays={days}/>
      )}
    </>
  );
});