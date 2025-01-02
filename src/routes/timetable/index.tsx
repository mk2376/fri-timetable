import { component$, useSignal, useContext, useVisibleTask$ } from '@builder.io/qwik';
import { qwikify$ } from '@builder.io/qwik-react';
import type { Timetable, Activity } from '../../models/Timetable'
import { dummyTimetable } from './dummyTimetable'; // Temporary data
import dayjs from "../../lib/dayjsConfig"
import { type Dayjs } from 'dayjs';
import { Platform } from '~/lib/state/platform';
import Sticky from 'react-sticky-el';
import { Mode } from '~/lib/state/mode';

const QSticky = qwikify$(Sticky)

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
          <div key={`${day}-${grouping.start}-${grouping.end}`} class="flex flex-row">
            {
              Array.from({length: maxActivityCol + 1}, (_, i) => i).map((i) => {
                return (
                  <div key={i} class="flex flex-col w-full">
                    {
                      groupHours.map((hour) => {
                        const activity = grouping.activities.find((activity) => (activity.dateFrom.getHours() == hour && activity.col == i));
                        return (
                          <div key={`${day}-${hour}-${i}`}>
                          {
                            activity
                            ?
                            <div
                              class="flex flex-row w-full h-16 border-b border-gray-300 dark:border-gray-600 relative"
                            >
                              <div
                                class="flex flex-col w-full min-w-max dark:text-black /* white does not provide enough contrast */ rounded-lg p-1 z-10 m-1 break-words overflow-hidden text-balance"
                                style={{
                                  backgroundColor: `${activity.color}`,
                                  height: `${dayjs(activity.dateTo).diff(dayjs(activity.dateFrom), "hour") * 4 - 0.6}rem`,
                                }}
                              >
                                <div class="text-base font-bold mb-1">
                                  {activity.shortName}_{activity.activityType}
                                </div>
                                <div class="text-sm italic mb-1">
                                  {activity.teacher.join(", ")}
                                </div>
                                <div class="text-base font-semibold">
                                  {activity.location}
                                </div>
                                
                                <div class="text-sm text-gray-500 dark:text-black mt-auto">
                                  {dayjs(activity.dateFrom).format("HH:mm")} - {dayjs(activity.dateTo).format("HH:mm")}
                                </div>
                              </div>
                            </div>
                            :
                            <div
                              class="flex flex-row w-full h-16 border-b border-gray-300 dark:border-gray-600 relative"
                            >
                            </div>
                          }
                          </div>
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

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => document.body.classList.add("overflow-x-scroll"))

  return (
    <div class="flex flex-row w-full">
      <div class="flex flex-col sticky left-0 z-50 bg-white dark:bg-black">
        <div class="py-4 border-b border-gray-800 dark:border-gray-200">
          <br />
        </div>
        {hours.map((hour) => (
          <div key={hour} class="flex h-16 pl-2 border-b border-gray-300 dark:border-gray-600">
            <div class="text-right">
              {`${dayjs().hour(hour).format("HH")}:00`}
            </div>
          </div>
        ))}
      </div>

      {days.map((day, index) => {
        const dayGroupings = props.daysData[index];
        return (
          <div key={day} class="flex flex-col w-[20%] min-w-max border-l border-gray-800 dark:border-gray-200">
            <div class="flex flex-row py-4 font-bold text-center border-b border-gray-600 dark:border-gray-200">
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
  let todayDayIndex = dayjs().day()
  // if Sunday (0) or Saturday (6), then set it to be Monday (1), since most people checking over the weekend will probably want to look at Monday.
  if(todayDayIndex == 0 || todayDayIndex == 6)
    todayDayIndex = 1 
  const selectedDaySignal = useSignal(props.possibleDays[todayDayIndex - 1]);
  const days = props.possibleDays;
  const daysShort = ["PON", "TOR", "SRE", "ČET", "PET"];
  const hours = Array.from({ length: 15 }, (_, i) => i + 7);
  
  const stickyPositionSignal = useSignal("sticky");

  return (
    <>
      <div class="flex flex-row">
        <div class="flex flex-col sticky left-0 z-50 bg-white dark:bg-black">
          <div class="py-4 border-y border-gray-800 dark:border-gray-200">
            <br />
          </div>
          {hours.map((hour) => (
            <div
              key={hour}
              class="flex h-16 pl-2 border-b border-gray-300 dark:border-gray-600"
            >
              <div class="text-right">
                {`${dayjs().hour(hour).format('HH')}:00`}
              </div>
            </div>
          ))}
        </div>

        <div class="flex flex-col w-full border border-gray-800 dark:border-gray-200 overflow-x-scroll">
          <div class="left-0 z-50"
          style={{
            position: stickyPositionSignal.value as unknown as undefined
          }}
          >
            <QSticky onFixedToggle$={(isFixed) => (isFixed ? (stickyPositionSignal.value = "relative") : (stickyPositionSignal.value = "sticky"))}>
              <div class="flex flex-row font-bold text-center items-center shadow-lg border-b border-gray-600 dark:border-gray-200 bg-white dark:bg-black">
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
            </QSticky>
          </div>
          
          <div class="flex flex-row w-full min-w-max">
            <div class="flex flex-col w-full min-w-max">
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
  const isDarkMode = useContext(Mode);

  function rgbaToHsv(r: number, g: number, b: number, a = 1) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    let s = 0;
    const v = max;

    if (delta !== 0) {
        s = delta / max;

        if (max === r) {
            h = ((g - b) / delta + (g < b ? 6 : 0)) % 6;
        } else if (max === g) {
            h = (b - r) / delta + 2;
        } else {
            h = (r - g) / delta + 4;
        }

        h *= 60;
    }

    return { h, s, v, a };
  }

  function hsvToRgba(h: number, s: number, v: number, a = 1) {
      const c = v * s;
      const x = c * (1 - Math.abs((h / 60) % 2 - 1));
      const m = v - c;

      let r = 0, g = 0, b = 0;

      if (h >= 0 && h < 60) {
          r = c; g = x; b = 0;
      } else if (h >= 60 && h < 120) {
          r = x; g = c; b = 0;
      } else if (h >= 120 && h < 180) {
          r = 0; g = c; b = x;
      } else if (h >= 180 && h < 240) {
          r = 0; g = x; b = c;
      } else if (h >= 240 && h < 300) {
          r = x; g = 0; b = c;
      } else {
          r = c; g = 0; b = x;
      }

      r = Math.round((r + m) * 255);
      g = Math.round((g + m) * 255);
      b = Math.round((b + m) * 255);

      return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  function changeActivitiesColorForDarkMode(isDarkMode: boolean, timetable: Timetable): Timetable {
    if(!isDarkMode)
      return timetable;
    
    for(const subject of timetable.subjects) {
      const subjectColorComponents: number[] = subject.color.split("(")[1].split(")")[0].split(",").map(Number);
      const [r, g, b, a] = subjectColorComponents;

      const { h, s, v } = rgbaToHsv(r, g, b, a);

      const adjustedV = Math.min(1, v * 1.2); 
      const adjustedS = Math.min(1, s * 1.5);

      subject.color = hsvToRgba(h, adjustedS, adjustedV, a);
    }
    return timetable;
  }

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

  const timetable = changeActivitiesColorForDarkMode(isDarkMode.isDarkTheme.value ? true : false, getSelectedWeekTimetable(dummyTimetable, startOfWeek, endOfWeek))

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