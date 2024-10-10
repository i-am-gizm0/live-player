export type Program = {
  start: Date;
  lengthMs: number;
  programName: string;
  episodeName: string;
  imgSynopsis: string;
  airing: "NEW" | "LIVE" | "";
  imgHero: string;
  gameId: string;
};
