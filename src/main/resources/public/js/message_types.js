//dosnt belong here, but anyway
let file_list_buf = new Map();

const INIT_SENDER_REQ = "\x01";
const INIT_RECEIVER_REQ = "\x02";
const INIT_SENDER_RESP = 1;
const INIT_RECEIVER_RESP = 2;

const PASS_AWAY = 7;
const PASS_AWAY_ = "\x07";
const PASS_AWAY_FILE_REQ = 8;
const PASS_AWAY_FILE_CHUNK = 9;
const PASS_AWAY_FILE_CHUNK_ = "\x09";
