import { ClassValue, clsx } from 'clsx';
import { formatDistanceToNowStrict } from 'date-fns';
import locale from 'date-fns/locale/vi';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sleep(second: number) {
  return new Promise((res) => setTimeout(res, second * 1000));
}

const formatDistanceLocale = {
  lessThanXSeconds: 'vừa xong',
  xSeconds: 'vừa xong',
  halfAMinute: 'vừa xong',
  lessThanXMinutes: '{{count}} phút',
  xMinutes: '{{count}} phút',
  aboutXHours: '{{count}} giờ',
  xHours: '{{count}} giờ',
  xDays: '{{count}} ngày',
  aboutXWeeks: '{{count}} tuần',
  xWeeks: '{{count}} tuần',
  aboutXMonths: '{{count}} tháng',
  xMonths: '{{count}} tháng',
  aboutXYears: '{{count}} năm',
  xYears: '{{count}} năm',
  overXYears: '{{count}} năm',
  almostXYears: '{{count}} năm',
};

function formatDistance(token: string, count: number, options?: any): string {
  options = options || {};

  const result = formatDistanceLocale[
    token as keyof typeof formatDistanceLocale
  ].replace('{{count}}', count.toString());

  if (options.addSuffix) {
    if (options.comparison > 0) {
      return 'Khoảng ' + result;
    } else {
      if (result === 'vừa xong') return result;
      return result + ' trước';
    }
  }

  return result;
}

export function formatTimeToNow(date: Date | number): string {
  return formatDistanceToNowStrict(date, {
    addSuffix: true,
    locale: {
      ...locale,
      formatDistance,
    },
  });
}

export const fbRegex =
  /(?:(?:http|https):\/\/)?(?:www.)?facebook.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[?\w\-]*\/)?(?:profile.php\?id=(?=\d.*))?([\w\.\-]*)/;
export const disRegex =
  /(https:\/\/)?(www)?discord.?(gg|com)?\/?(invite)?\/([^\/\?\&\%]*)\S/;
export const vieRegex =
  /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\w ]+$/;

type targetProps = {
  time: number;
  view: number;
}[];

export function filterView({
  target,
  timeRange,
  currentTime,
}: {
  target: targetProps;
  timeRange: number[];
  currentTime: number;
}) {
  const excludedTarget = target.filter((t) => t.time <= currentTime);
  let viewTimeHolder: number,
    res: number[] = [];

  const currentTimeIdx = excludedTarget.findIndex((t) => t.time >= currentTime);
  if (currentTimeIdx === -1) res.push(0);
  else {
    const lastValArr = excludedTarget.pop();
    res.push(Number(lastValArr?.view));
    viewTimeHolder = lastValArr?.time!;
  }

  const timeRangeDistance = excludedTarget.map((t) =>
    Math.abs(viewTimeHolder - t.time)
  );
  const inTimeRange = timeRangeDistance.map((td) =>
    timeRange.find((tr) => tr >= td)
  );

  for (let i = 1; i < timeRange.length; i++) {
    const spliceStart = inTimeRange.findIndex((tr) => tr === timeRange[i]);
    const spliceCount = inTimeRange.filter(
      (tr) => tr === inTimeRange[i]
    ).length;

    const splicedArr = excludedTarget.splice(spliceStart, spliceCount);
    let count = 0;
    Array.from(splicedArr, (x) => (count += Number(x.view)));
    res.push(count);
  }

  return res;
}

export function dataUrlToBlob(dataUrl: string) {
  const splittedData = dataUrl.split(',');
  const byteStr = atob(splittedData[1]);
  const typeStr = splittedData[0].split(':')[1].split(';')[0];
  const buffer = new ArrayBuffer(byteStr.length);
  const dv = new DataView(buffer);

  for (let i = 0; i < byteStr.length; i++) {
    dv.setUint8(i, byteStr.charCodeAt(i));
  }

  return new Blob([buffer], { type: typeStr });
}

export const normalizeText = (text: string) =>
  text.normalize('NFKD').replace(/[\u0300-\u036F]/g, '');

export const shuffeArray = <T>(array: T[]) => {
  let arr = array;

  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }

  return arr;
};

const keyStr =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

const triplet = (e1: number, e2: number, e3: number) =>
  keyStr.charAt(e1 >> 2) +
  keyStr.charAt(((e1 & 3) << 4) | (e2 >> 4)) +
  keyStr.charAt(((e2 & 15) << 2) | (e3 >> 6)) +
  keyStr.charAt(e3 & 63);

export const rgbDataURL = (r: number, g: number, b: number) =>
  `data:image/gif;base64,R0lGODlhAQABAPAA${
    triplet(0, r, g) + triplet(b, 255, 255)
  }/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==`;
