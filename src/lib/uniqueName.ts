import {
  NumberDictionary,
  type Config,
  uniqueNamesGenerator,
} from 'unique-names-generator';

const CatNames = [
  'MoeMongMo',
  'MoeBietTuot',
  'MoeDiHia',
  'MoeBayBong',
  'MoeBienThai',
  'MoeTangDong',
  'MoeHipHop',
  'MoeLuoiNhat',
  'MoeNhayNhot',
  'MoeFlexing',
  'MoePressing',
  'MoeMoeMoe',
  'MoeSimpMy',
  'MoeNguoc',
  'BLVAnhMoe',
  'MoeItalia',
  'MoeVOZER',
  'MoeThoNgoc',
  'MoeHutCan',
  'MoeTeNan',
  'MoeNghien',
  'MeoPayLak',
  'MoeVuiVe',
  'MoeNgocNghech',
];

const numberDictionary = NumberDictionary.generate({ min: 1, max: 99999 });

const customConfig: Config = {
  dictionaries: [CatNames, numberDictionary],
  separator: '',
  length: 2,
};

export const generateRandomName = uniqueNamesGenerator(customConfig);
