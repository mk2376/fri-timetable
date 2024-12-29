import { component$, useSignal, useContext } from '@builder.io/qwik';
import type { Timetable, Activity } from '../../models/Timetable'
import { dummyTimetable } from './dummyTimetable'; // Temporary data
import dayjs from "../../lib/dayjsConfig"
import { type Dayjs } from 'dayjs';
import { Platform } from '~/lib/state/platform';

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


const TimetableColumn = component$((props: timetableColumnProps) => {
  const day = props.day
  return (
    <>
    {
      props.dayData.map((grouping) => {
        const groupHours = Array.from({ length: grouping.end.getHours() - grouping.start.getHours()}, (_, i) => i + grouping.start.getHours());
        const maxActivityCol = grouping.activities.reduce((acc, el) => (!acc || el.col > acc) ? el.col : acc, 0);
        return (
          <div key={`${day}-${grouping.start}-${grouping.end}`} class="flex flex-row ">
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
                                class="flex flex-col w-full h-full dark:text-black /* white does not provide enough contrast */ rounded-lg p-1 z-10 m-1"
                                style={{
                                  backgroundColor: `${activity.color}`,
                                  height: `${dayjs(activity.dateTo).diff(dayjs(activity.dateFrom), "hour") * 3.7}rem`,
                                }}
                              >
                                <div class="font-bold mb-1">
                                  {activity.shortName}_{activity.activityType}
                                </div>
                                <div class="text-sm italic mb-2">
                                  {activity.teacher.join(", ")}
                                </div>
                                <div class="text-sm font-semibold">
                                  {activity.location}
                                </div>
                                
                                <div class="text-sm text-gray-500 mt-auto">
                                  {dayjs(activity.dateFrom).format("HH:mm")} - {dayjs(activity.dateTo).format("HH:mm")}
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

const DesktopTimetable = component$((props: timetableProps) => {
  const days = props.possibleDays;
  const hours = Array.from({ length: 15 }, (_, i) => i + 7);

  return (
    <div class="flex flex-row shadow-md rounded-lg overflow-auto">
      <div class="flex flex-col sticky left-0 z-50">
        <div class="py-4 border-b border-gray-300">
          <br />
        </div>
        {hours.map((hour) => (
          <div key={hour} class="flex h-16 pl-2 border-b border-gray-300">
            <div class="text-right">
              {`${dayjs().hour(hour).format("HH")}:00`}
            </div>
          </div>
        ))}
      </div>

      {days.map((day, index) => {
        const dayGroupings = props.daysData[index];
        return (
          <div key={day} class="flex flex-col min-w-[20%] border-l border-gray-800">
            <div class="flex flex-row py-4 font-bold text-center border-b border-gray-600">
              <div class="flex flex-col w-full">{day}</div>
            </div>

            <div class="flex flex-row w-full">
              <div class="flex flex-col w-full">
                <TimetableColumn
                  dayData={dayGroupings}
                  day={day}
                  dayIndex={index}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});


const MobileTimetable = component$((props: timetableProps) => {
  const selectedDaySignal = useSignal("Torek"); // Signal for the currently selected day
  
  const days = props.possibleDays;
  const daysShort = ["PON", "TOR", "SRE", "ČET", "PET"];
  const hours = Array.from({ length: 15 }, (_, i) => i + 7);

  return (
    <>
      <div class="flex flex-row">
        <div class="flex flex-col">
          <div class="py-4 border-y border-gray-300">
            <br />
          </div>
          {hours.map((hour) => (
            <div
              key={hour}
              class="flex h-16 pl-2 border-b border-gray-300"
            >
              <div class="text-right">
                {`${dayjs().hour(hour).format('HH')}:00`}
              </div>
            </div>
          ))}
        </div>

        <div class="flex flex-col w-full border border-gray-800">
          <div class="flex flex-row sticky top-0 z-50 font-bold text-center items-center shadow-lg border-b border-gray-600">
            {daysShort.map((day, index) => (
              <div
                key={index}
                class={`flex flex-col justify-center items-center w-full py-4 cursor-pointer transition-all relative ${
                  selectedDaySignal.value === days[index]
                    ? 'font-bold w-1/3'
                    : 'text-gray-500 w-1/4'
                }`}
                onClick$={() => (selectedDaySignal.value = days[index])}
              >
                <span>{day}</span>

                <div
                  class={`absolute bottom-0 left-0 h-1 w-full transition-all duration-300 ${
                    selectedDaySignal.value === days[index] ? 'bg-primary' : 'bg-transparent'
                  }`}
                />
              </div>
            ))}
          </div>

          <div class="flex flex-row w-full">
            <div class="flex flex-col w-full">
              <TimetableColumn
                dayData={props.daysData[days.findIndex((el) => el === selectedDaySignal.value)]}
                day={selectedDaySignal.value}
                dayIndex={days.findIndex((el) => el === selectedDaySignal.value)}
              />
            </div>
          </div>
        </div>

      </div>
    </>
  );
});

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

  const dayScheduleGroup = getScheduleGroupingForEachDay(startOfWeek);
  const days = ["Ponedeljek", "Torek", "Sreda", "Četrtek", "Petek"]

  const platform = useContext(Platform)

  return (
    <>
      {platform.isMobile.value ? (
        <MobileTimetable daysData={dayScheduleGroup} possibleDays={days}/>
      ) : (
        <DesktopTimetable daysData={dayScheduleGroup} possibleDays={days}/>
      )}
    </>
  );
});