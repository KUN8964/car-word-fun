export type VehicleColor = 'red' | 'blue' | 'yellow' | 'green' | 'white' | 'black' | 'silver' | 'orange' | 'gray' | 'brown' | 'camouflage' | 'blackWhite' | 'other' | 'unknown';

export type VehicleCategory = 'car' | 'race' | 'bus' | 'construction' | 'motorcycle' | 'tank' | 'watercraft' | 'offroad' | 'aircraft';

export type Vehicle = {
  id: string;
  name: string;
  image: string;
  color: VehicleColor;
  category: VehicleCategory;
};

export const VALID_COLORS: VehicleColor[] = [
  'red', 'blue', 'yellow', 'green', 'white', 'black',
  'silver', 'orange', 'gray', 'brown', 'camouflage', 'blackWhite', 'other', 'unknown',
];

export const VEHICLES: Vehicle[] = [
  {
    "id": "a4",
    "name": "奥迪A4",
    "image": "/vehicle-library/a4.png",
    "color": "silver",
    "category": "car"
  },
  {
    "id": "r8",
    "name": "奥迪R8",
    "image": "/vehicle-library/r8.png",
    "color": "silver",
    "category": "car"
  },
  {
    "id": "g63",
    "name": "奔驰G63",
    "image": "/vehicle-library/g63.png",
    "color": "black",
    "category": "car"
  },
  {
    "id": "slk",
    "name": "奔驰slk",
    "image": "/vehicle-library/slk.png",
    "color": "silver",
    "category": "car"
  },
  {
    "id": "vehicle-05",
    "name": "本田幼兽",
    "image": "/vehicle-library/vehicle-05.png",
    "color": "blue",
    "category": "motorcycle"
  },
  {
    "id": "vehicle-06",
    "name": "比亚迪公交车",
    "image": "/vehicle-library/vehicle-06.png",
    "color": "blue",
    "category": "bus"
  },
  {
    "id": "vehicle-07",
    "name": "边三轮",
    "image": "/vehicle-library/vehicle-07.png",
    "color": "green",
    "category": "motorcycle"
  },
  {
    "id": "75710",
    "name": "别拉斯75710矿用自卸卡车",
    "image": "/vehicle-library/75710.png",
    "color": "yellow",
    "category": "construction"
  },
  {
    "id": "777",
    "name": "波音777",
    "image": "/vehicle-library/777.png",
    "color": "white",
    "category": "aircraft"
  },
  {
    "id": "gp-bgp001",
    "name": "布朗GP BGP001",
    "image": "/vehicle-library/gp-bgp001.png",
    "color": "white",
    "category": "race"
  },
  {
    "id": "400",
    "name": "川崎 忍者400",
    "image": "/vehicle-library/400.png",
    "color": "green",
    "category": "motorcycle"
  },
  {
    "id": "vehicle-12",
    "name": "大众甲壳虫",
    "image": "/vehicle-library/vehicle-12.png",
    "color": "green",
    "category": "car"
  },
  {
    "id": "v4",
    "name": "杜卡迪v4",
    "image": "/vehicle-library/v4.png",
    "color": "red",
    "category": "motorcycle"
  },
  {
    "id": "156-f1",
    "name": "法拉利 156 F1",
    "image": "/vehicle-library/156-f1.png",
    "color": "red",
    "category": "race"
  },
  {
    "id": "f2004",
    "name": "法拉利 F2004",
    "image": "/vehicle-library/f2004.png",
    "color": "red",
    "category": "race"
  },
  {
    "id": "250gto",
    "name": "法拉利250GTO",
    "image": "/vehicle-library/250gto.png",
    "color": "red",
    "category": "car"
  },
  {
    "id": "312t",
    "name": "法拉利312T",
    "image": "/vehicle-library/312t.png",
    "color": "red",
    "category": "race"
  },
  {
    "id": "458",
    "name": "法拉利458",
    "image": "/vehicle-library/458.png",
    "color": "red",
    "category": "car"
  },
  {
    "id": "f40",
    "name": "法拉利F40",
    "image": "/vehicle-library/f40.png",
    "color": "red",
    "category": "car"
  },
  {
    "id": "ae86",
    "name": "丰田AE86",
    "image": "/vehicle-library/ae86.png",
    "color": "white",
    "category": "car"
  },
  {
    "id": "vehicle-21",
    "name": "福特野马",
    "image": "/vehicle-library/vehicle-21.png",
    "color": "white",
    "category": "car"
  },
  {
    "id": "t",
    "name": "福特T型车",
    "image": "/vehicle-library/t.png",
    "color": "black",
    "category": "car"
  },
  {
    "id": "h1",
    "name": "悍马H1",
    "image": "/vehicle-library/h1.png",
    "color": "green",
    "category": "offroad"
  },
  {
    "id": "rb7",
    "name": "红牛RB7",
    "image": "/vehicle-library/rb7.png",
    "color": "blue",
    "category": "race"
  },
  {
    "id": "vehicle-25",
    "name": "灰狗旅游巴士",
    "image": "/vehicle-library/vehicle-25.png",
    "color": "silver",
    "category": "bus"
  },
  {
    "id": "e-type",
    "name": "捷豹E-Type",
    "image": "/vehicle-library/e-type.png",
    "color": "green",
    "category": "car"
  },
  {
    "id": "d11",
    "name": "卡特彼勒D11推土机",
    "image": "/vehicle-library/d11.png",
    "color": "yellow",
    "category": "construction"
  },
  {
    "id": "288",
    "name": "克虏伯288斗轮挖掘机",
    "image": "/vehicle-library/288.png",
    "color": "yellow",
    "category": "construction"
  },
  {
    "id": "countach",
    "name": "兰博基尼Countach",
    "image": "/vehicle-library/countach.png",
    "color": "yellow",
    "category": "car"
  },
  {
    "id": "rs01",
    "name": "雷诺RS01",
    "image": "/vehicle-library/rs01.png",
    "color": "black",
    "category": "race"
  },
  {
    "id": "t282b",
    "name": "利勃海尔T282B矿用自卸卡车",
    "image": "/vehicle-library/t282b.png",
    "color": "yellow",
    "category": "construction"
  },
  {
    "id": "79-01",
    "name": "莲花79-01",
    "image": "/vehicle-library/79-01.png",
    "color": "black",
    "category": "race"
  },
  {
    "id": "79-02",
    "name": "莲花79-02",
    "image": "/vehicle-library/79-02.png",
    "color": "black",
    "category": "race"
  },
  {
    "id": "vehicle-34",
    "name": "伦敦双层巴士",
    "image": "/vehicle-library/vehicle-34.png",
    "color": "red",
    "category": "bus"
  },
  {
    "id": "f1",
    "name": "迈凯轮F1",
    "image": "/vehicle-library/f1.png",
    "color": "orange",
    "category": "car"
  },
  {
    "id": "mp4",
    "name": "迈凯轮MP4",
    "image": "/vehicle-library/mp4.png",
    "color": "white",
    "category": "race"
  },
  {
    "id": "w07-hybrid",
    "name": "梅赛德斯W07 Hybrid",
    "image": "/vehicle-library/w07-hybrid.png",
    "color": "silver",
    "category": "race"
  },
  {
    "id": "gti",
    "name": "庞巴迪喜度GTI",
    "image": "/vehicle-library/gti.png",
    "color": "yellow",
    "category": "watercraft"
  },
  {
    "id": "rxt-x-400",
    "name": "庞巴迪喜度RXT-X 400",
    "image": "/vehicle-library/rxt-x-400.png",
    "color": "green",
    "category": "watercraft"
  },
  {
    "id": "gtr",
    "name": "日产GTR",
    "image": "/vehicle-library/gtr.png",
    "color": "gray",
    "category": "car"
  },
  {
    "id": "vehicle-41",
    "name": "三一重工混凝土泵车",
    "image": "/vehicle-library/vehicle-41.png",
    "color": "yellow",
    "category": "construction"
  },
  {
    "id": "vehicle-42",
    "name": "三一重工汽车起重机",
    "image": "/vehicle-library/vehicle-42.png",
    "color": "yellow",
    "category": "construction"
  },
  {
    "id": "vehicle-43",
    "name": "挖挖机",
    "image": "/vehicle-library/vehicle-43.png",
    "color": "yellow",
    "category": "construction"
  },
  {
    "id": "fw14b",
    "name": "威廉姆斯FW14B",
    "image": "/vehicle-library/fw14b.png",
    "color": "blue",
    "category": "race"
  },
  {
    "id": "es8",
    "name": "蔚来ES8",
    "image": "/vehicle-library/es8.png",
    "color": "blue",
    "category": "car"
  },
  {
    "id": "pc8000",
    "name": "小松PC8000",
    "image": "/vehicle-library/pc8000.png",
    "color": "yellow",
    "category": "construction"
  },
  {
    "id": "vehicle-47",
    "name": "越野运输车",
    "image": "/vehicle-library/vehicle-47.png",
    "color": "green",
    "category": "offroad"
  },
  {
    "id": "vehicle-48",
    "name": "主战坦克",
    "image": "/vehicle-library/vehicle-48.png",
    "color": "green",
    "category": "tank"
  },
  {
    "id": "cat-797",
    "name": "CAT 797矿用自卸卡车",
    "image": "/vehicle-library/cat-797.png",
    "color": "yellow",
    "category": "construction"
  },
  {
    "id": "ram-1500-rebel",
    "name": "RAM 1500 Rebel",
    "image": "/vehicle-library/ram-1500-rebel.png",
    "color": "black",
    "category": "offroad"
  },
  {
    "id": "vespa150",
    "name": "vespa150",
    "image": "/vehicle-library/vespa150.png",
    "color": "blue",
    "category": "motorcycle"
  },
  {
    "id": "willys-mb",
    "name": "Willys MB 二战军用吉普",
    "image": "/vehicle-library/willys-mb.png",
    "color": "green",
    "category": "offroad"
  }
];
