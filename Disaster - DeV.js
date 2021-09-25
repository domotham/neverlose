// Libs
function InBounds(x, y, w, h) {
    var cursor = Input.GetCursorPosition();
    if (cursor[0] >= x && cursor[0] < x + w && cursor[1] >= y && cursor[1] < y + h)
        return true;

    return false;
}

function Normalize(angle) {
    if (angle < -180)
        angle += 360;

    if (angle > 180)
        angle -= 360;

    return angle;
}

Number.prototype.zeroPad = function () {
    return ('0' + this).slice(-2);
};

Render.ShadowString = function (x, y, a, l, c, f) {
    // Get the minimum alpha.
    const alpha = Math.min(c[3], 235);

    Render.String(x + 1, y + 1, a, l, [10, 10, 10, alpha], f);
    Render.String(x, y, a, l, c, f);
}

/*
Render.String = function (x, y, a, s, c, f) {
    // Get the minimum alpha.
    const alpha = Math.min(235, c[3]);

    Render.String(x - 1, y - 1, a, s, [10, 10, 10, alpha], f);
    Render.String(x - 1, y + 1, a, s, [10, 10, 10, alpha], f);
    Render.String(x + 1, y - 1, a, s, [10, 10, 10, alpha], f);
    Render.String(x + 1, y + 1, a, s, [10, 10, 10, alpha], f);
    Render.String(x, y, a, s, c, f);
}
*/


Render.SuperShadowString = function ( x, y, a, s, c, f)
{
    Render.String( x , y , a, s, c, f)
    Render.String( x - 1 , y - 1, a, s, c, f)
}


// FilledRoundRect function by Razer, found at Javascripting Discord

Render.FilledRoundRect = function(x, y, w, h, color) {
    Render.Line(x + 3, y + h, x + w - 2, y + h, color);//bottom
    Render.Line(x, y + 3, x, y + h - 2, color);//left
    Render.Line(x + w, y + 3, x + w, y + h - 2, color);//right
    Render.Line(x + 3, y, x + w - 2, y, color);//top
    Render.FilledRect(x + 1, y + 1, w - 1, h - 1, color);
    /*
    Render.Arc(x + 3, y + 3, 3, 2, 180, 90, 12, color);//TL
    Render.Arc(x + w - 3, y + 3, 3, 2, 270, 90, 12, color);//TR
    Render.Arc(x + 3, y + h - 3, 3, 2, 90, 90, 12, color);//BL
    Render.Arc(x + w - 3, y + h - 3, 3, 2, 0, 90, 12, color);//BR
    */
}

function Format(string, values) {
    const array = string.split("%");
    const final_string = array[0];

    if (array.length - 1 != values.length)
        throw new Error("[Format] The amount of placeholders does not match the amount of values.");

    for (var i = 1; i < array.length; i++)
        final_string += values[i - 1] + array[i];

    return final_string;
}

function subtract(vec, vec2) {
    return [
        vec[0] - vec2[0],
        vec[1] - vec2[1],
        vec[2] - vec2[2]
    ];
};

function multiply(vec, vec2) {
    return [
        vec[0] * vec2[0],
        vec[1] * vec2[1],
        vec[2] * vec2[2]
    ];
};

function normalize(angle) {
    // If angle is lower than 180, adds 360.
    while (angle < -180)
        angle += 360;

    // If angle is greater than 180, subtract 360.
    while (angle > 180)
        angle -= 360;

    // Return normalized angle.
    return angle;
}

function extrapolate(entity, position, ticks) {
    // Get this entity's velocity.
    const velocity = Entity.GetProp(entity, "CBasePlayer", "m_vecVelocity[0]");

    // Get the server's tick interval.
    const interval = Globals.TickInterval();

    // Extrapolate the position by the velocity.
    // In this case, we're 'predicting' where this entity will be in one second.
    position[0] += velocity[0] * interval * ticks;
    position[1] += velocity[1] * interval * ticks;
    position[2] += velocity[2] * interval * ticks;

    // Return the extrapolated position.
    return position;
};

function degree_to_radian(degree) {
    return degree * Math.PI / 180;
}

function angle_to_vector(angles) {
    // Calculate sines and cosines.
    const sp = Math.sin(degree_to_radian(angles[0]));
    const cp = Math.cos(degree_to_radian(angles[0]));
    const sy = Math.sin(degree_to_radian(angles[1]));
    const cy = Math.cos(degree_to_radian(angles[1]));

    // Return the calculated direction vector.
    return [cp * cy, cp * sy, -sp]
}

function getDistance(me, pos) {
    // Get the specified entity's origin.
    const origin = Entity.GetRenderOrigin(me);

    // Calculate the difference between the destination and origin.
    const sub = subtract(pos, origin);

    // Calculate the distance.
    const distance = Math.sqrt(sub[0] * sub[0] + sub[1] * sub[1] + sub[2] * sub[2]);

    // Return distance.
    return distance;
}

function Length2D(vec) {
    return Math.sqrt(vec[0] ** 2 + vec[1] ** 2);
}

function getFOV(me, pos) {
    // Get entity properties.
    const eye_pos = Entity.GetEyePosition(me);
    const viewangles = Local.GetViewAngles();

    // Calculate the difference between the desired position and our eye position.
    const sub = subtract(pos, eye_pos);

    // Calculate yaw and pitch.
    const yaw = Math.atan2(sub[1], sub[0]) * 180 / Math.PI;
    const pitch = -Math.atan2(sub[2], Math.sqrt(sub[0] ** 2 + sub[1] ** 2)) * 180 / Math.PI;

    // Calculate yaw and pitch delta.
    var yaw_delta = ((viewangles[1] % 360 - yaw % 360) % 360);
    const pitch_delta = viewangles[0] - pitch;

    // Normalize our yaw delta so it doesn't exceed source engine's mins and maxs.
    yaw_delta = normalize(yaw_delta);

    // Calculate the FOV.
    // Return the calculated fov.
    return Math.sqrt(yaw_delta * yaw_delta + pitch_delta * pitch_delta);
}

function getBestTarget(me) {

    /**
     * Checks if an entity is invalid.
     * @param Number entity 
     */
    const sanitize = function (entity) {
        return Entity.IsDormant(entity) || !Entity.IsAlive(entity);
    }

    // Get our freestanding mode.
    const distance_based = UI.GetValue(UI_List.dropdown_freestandtarget);

    // Get enemies.
    const enemies = Entity.GetEnemies();

    // Initialize the object where our data will be stored.
    var data = {
        target: null,
        fov: 180,
        distance: 8192
    };

    // Loop through every single enemy.
    for (var i = 0; i < enemies.length; i++) {
        // Get our current enemy.
        const entity = enemies[i];

        // Check if this enemy is valid.
        if (sanitize(entity))
            return;

        // Check if we are not using 'Distance' targeting mode, thus, we're using 'Crosshair'.
        if (!distance_based) {
            // Get the enemy's head position.
            const head_position = Entity.GetHitboxPosition(entity, 0);

            // Calculate the FOV.
            const fov = getFOV(me, head_position);

            // Check if this FOV is lower than the stored FOV.
            // This means that this enemy is closer to our crosshair than the
            // previous ones.
            if (fov < data.fov) {
                // Update our target and save changes.
                data.fov = fov;
                data.target = entity;
            }
        }

        // Otherwise, we're using 'Distance' mode.
        else {
            // Get the enemy's origin.
            const origin = Entity.GetRenderOrigin(entity);

            // Calculate the distance.
            const distance = getDistance(me, origin);

            // Check if this distance is lower than the stored distance.
            // Same logic as FOV.
            if (distance < data.distance) {
                // Update our target and save changes.
                data.distance = distance;
                data.target = entity;
            }
        }
    }

    // Update our global target variable.
    ent_Target.target = data.target;
}

hitboxes = [
    'generic',
    'head',
    'chest',
    'stomach',
    'left arm',
    'right arm',
    'left leg',
    'right leg',
    '?'
];

function getHitboxName(index) {
    var hitboxName = "";
    switch (index) {
        case 0:
            hitboxName = "Head";
            break;
        case 1:
            hitboxName = "Neck";
            break;
        case 2:
            hitboxName = "Pelvis";
            break;
        case 3:
            hitboxName = "Body";
            break;
        case 4:
            hitboxName = "Thorax";
            break;
        case 5:
            hitboxName = "Chest";
            break;
        case 6:
            hitboxName = "Upper chest";
            break;
        case 7:
            hitboxName = "Left thigh";
            break;
        case 8:
            hitboxName = "Right thigh";
            break;
        case 9:
            hitboxName = "Left calf";
            break;
        case 10:
            hitboxName = "Right calf";
            break;
        case 11:
            hitboxName = "Left foot";
            break;
        case 12:
            hitboxName = "Right foot";
            break;
        case 13:
            hitboxName = "Left hand";
            break;
        case 14:
            hitboxName = "Right hand";
            break;
        case 15:
            hitboxName = "Left upper arm";
            break;
        case 16:
            hitboxName = "Left forearm";
            break;
        case 17:
            hitboxName = "Right upper arm";
            break;
        case 18:
            hitboxName = "Right forearm";
            break;
        default:
            hitboxName = "Generic";
    }

    return hitboxName;
}

function HitgroupName(index) {
    return hitboxes[index] || 'body';
}

function canShiftShot(val) {
    var localPlayer = Entity.GetLocalPlayer(),
        localWeapon = Entity.GetWeapon(localPlayer);
    if (null == localPlayer || null == localWeapon) return !1;
    var tickBase = Entity.GetProp(localPlayer, "CCSPlayer", "m_nTickBase"),
        _tickBase = Globals.TickInterval() * (tickBase - val);
    return !(_tickBase < Entity.GetProp(localPlayer, "CCSPlayer", "m_flNextAttack")) && !(_tickBase < Entity.GetProp(localWeapon, "CBaseCombatWeapon", "m_flNextPrimaryAttack"))
}

function extrapolate_tick(entity, ticks, x, y, z) {
    velocity = Entity.GetProp(entity, "CBasePlayer", "m_vecVelocity[0]");
    new_pos = [x, y, z];
    new_pos[0] = new_pos[0] + velocity[0] * Globals.TickInterval() * ticks;
    new_pos[1] = new_pos[1] + velocity[1] * Globals.TickInterval() * ticks;
    new_pos[2] = new_pos[2] + velocity[2] * Globals.TickInterval() * ticks;
    return new_pos;
}

function is_lethal(entity) {
    local_player = Entity.GetLocalPlayer();
    eye_pos = Entity.GetEyePosition(local_player);
    ticks = UI.GetValue(["Rage", "Force Conditions", "Force Conditions", "Extrapolated ticks"]);
    extrapolated_location = extrapolate_tick(local_player, ticks, eye_pos[0], eye_pos[1], eye_pos[2]);
    entity_hp = Entity.GetProp(entity, "CBasePlayer", "m_iHealth");
    pelvis_pos = Entity.GetHitboxPosition(entity, 2);
    body_pos = Entity.GetHitboxPosition(entity, 3);
    thorax_pos = Entity.GetHitboxPosition(entity, 4);
    pelvis_trace = Trace.Bullet(local_player, entity, extrapolated_location, pelvis_pos);
    body_trace = Trace.Bullet(local_player, entity, extrapolated_location, body_pos);
    thorax_trace = Trace.Bullet(local_player, entity, extrapolated_location, thorax_pos);
    lethal_damage = Math.max(pelvis_trace[1], body_trace[1], thorax_trace[1]);
    if (lethal_damage > entity_hp) return true;
    else return false;
}

function is_standing(entity) {
    if (!is_crouching(entity) && !is_moving(entity) && !is_walking(entity) && !is_inair(entity)) return true;
    else return false;
}

function is_crouching(entity) {
    flags = Entity.GetProp(entity, "CBasePlayer", "m_fFlags");
    if (flags & 1 << 1) return true;
    else return false;
}

function is_walking(entity) {
    entity_velocity = Entity.GetProp(entity, "CBasePlayer", "m_vecVelocity[0]");
    entity_speed = Math.sqrt(entity_velocity[0] * entity_velocity[0] + entity_velocity[1] * entity_velocity[1]);
    if (entity_speed >= 10 && entity_speed <= 85) return true;
    else return false;
}

function is_running(entity) {
    entity_velocity = Entity.GetProp(entity, "CBasePlayer", "m_vecVelocity[0]");
    entity_speed = Math.sqrt(entity_velocity[0] * entity_velocity[0] + entity_velocity[1] * entity_velocity[1]);
    if (entity_speed >= 165 && entity_speed < 250) return true;
    else return false;
}

function is_inair(entity) {
    flags = Entity.GetProp(entity, "CBasePlayer", "m_fFlags");
    if (!(flags & 1 << 0) && !(flags & 1 << 0x12)) return true;
    else return false;
}

function is_moving(entity) {
    const speed = Math.min(Length2D(Entity.GetProp(entity, "CBasePlayer", "m_vecVelocity[0]")), 350);

    if (speed > 1) {
        return true;
    } else {
        return false;
    }
}

function force_head(entity) {
    local_player = Entity.GetLocalPlayer();
    head_pos = Entity.GetHitboxPosition(entity, 0);
    head_damage = Trace.Bullet(local_player, entity, Entity.GetEyePosition(local_player), head_pos);
    Ragebot.ForceTargetMinimumDamage(entity, head_damage[1]);
}

function force_body() {
    if (!UI.GetValue(["Rage", "General", "General", "Key assignment", "Force body aim"])) {
        UI.ToggleHotkey(["Rage", "General", "General", "Key assignment", "Force body aim"])
    }
}

function disable_body() {
    if (UI.GetValue(["Rage", "General", "General", "Key assignment", "Force body aim"])) {
        UI.ToggleHotkey(["Rage", "General", "General", "Key assignment", "Force body aim"])
    }
}

function get_metric_distance(a, b) {
    return Math.floor(Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2)) * 0.0254);
}

function angle2Vector(val) {
    return pitch = val[0], yaw = val[1], [Math.cos(deg2Rad(pitch)) * Math.cos(deg2Rad(yaw)), Math.cos(deg2Rad(pitch)) * Math.sin(deg2Rad(yaw)), -Math.sin(deg2Rad(pitch))]
}

function deg2Rad(val) {
    return Math.PI / 180 * val
}

function closestTarget() {
    var local = Entity.GetLocalPlayer();
    var enemies = Entity.GetEnemies();
    var dists = [];
    for (e in enemies) {
        if (!Entity.IsAlive(enemies[e]) || Entity.IsDormant(enemies[e]) || !Entity.IsValid(enemies[e])) continue;
        dists.push([enemies[e], calcDist(Entity.GetHitboxPosition(local, 0), Entity.GetHitboxPosition(enemies[e], 0))]);
    }
    dists.sort(function (a, b) {
        return a[1] - b[1];
    });
    if (dists.length == 0 || dists == []) return target = -1;
    return dists[0][0];
}

function calcDist(a, b) {
    x = a[0] - b[0];
    y = a[1] - b[1];
    z = a[2] - b[2];
    return Math.sqrt(x * x + y * y + z * z);
}

function getDropdownValue(value, index) {
    var mask = 1 << index;
    return value & mask ? true : false;
}

function setDropdownValue(value, index, enable) {
    var mask = 1 << index;

    return enable ? (value | mask) : (value & ~mask);
}

function get_icon(a) {
    var letter = ""
    switch (a) {
        case "desert eagle":
            letter = "A"
            break
        case "dual berettas":
            letter = "B"
            break
        case "five seven":
            letter = "C"
            break
        case "glock 18":
            letter = "D"
            break
        case "ak 47":
            letter = "W"
            break
        case "aug":
            letter = "U"
            break
        case "awp":
            letter = "Z"
            break
        case "famas":
            letter = "R"
            break
        case "m249":
            letter = "g"
            break
        case "g3sg1":
            letter = "X"
            break
        case "galil ar":
            letter = "Q"
            break
        case "m4a4":
            letter = "S"
            break
        case "m4a1 s":
            letter = "T"
            break
        case "mac 10":
            letter = "K"
            break
        case "p2000":
            letter = "E"
            break
        case "ump 45":
            letter = "L"
            break
        case "xm1014":
            letter = "b"
            break
        case "pp bizon":
            letter = "M"
            break
        case "mag 7":
            letter = "d"
            break
        case "negev":
            letter = "f"
            break
        case "sawed off":
            letter = "c"
            break
        case "tec 9":
            letter = "w"
            break
        case "zeus x27":
            letter = "h"
            break
        case "p250":
            letter = "F"
            break
        case "mp7":
            letter = "N"
            break
        case "mp9":
            letter = "O"
            break
        case "nova":
            letter = "e"
            break
        case "p90":
            letter = "P"
            break
        case "scar 20":
            letter = "Y"
            break
        case "sg 553":
            letter = "V"
            break
        case "ssg 08":
            letter = "a"
            break
        case "knife":
            letter = "7"
            break
        case "flashbang":
            letter = "i"
            break
        case "high explosive grenade":
            letter = "j"
            break
        case "smoke grenade":
            letter = "k"
            break
        case "molotov":
            letter = "l"
            break
        case "decoy grenade":
            letter = "m"
            break
        case "incendiary grenade":
            letter = "n"
            break
        case "c4 explosive":
            letter = "o"
            break
        case "usp s":
            letter = "G"
            break
        case "cz75 auto":
            letter = "I"
            break
        case "r8 revolver":
            letter = "J"
            break
        case "bayonet":
            letter = "1"
            break
        case "flip knife":
            letter = "25"
            break
        case "gut knife":
            letter = "3"
            break
        case "karambit":
            letter = "4"
            break
        case "m9 bayonet":
            letter = "5"
            break
        case "falchion knife":
            letter = "25"
            break
        case "bowie knife":
            letter = "7"
            break
        case "butterfly knife":
            letter = "8"
            break
        case "shadow daggers":
            letter = "9"
            break
        case "ursus knife":
            letter = "7"
            break
        case "navaja knife":
            letter = "8"
            break
        case "stiletto knife":
            letter = "7"
            break
        case "skeleton knife":
            letter = "8"
            break
        case "huntsman knife":
            letter = "6"
            break
        case "talon knife":
            letter = "4"
            break
        case "classic knife":
            letter = "7"
            break
        case "paracord knife":
            letter = "1"
            break
        case "survival knife":
            letter = "2"
            break
        case "nomad knife":
            letter = "6"
            break
        default:
            letter = ""
            break
    }
    return letter
}

function box(data) {
    return {
      valid: data[0],
      x: data[1],
      y: data[2],
      w: data[3] - data[1],
      h: data[4] - data[2],
      
      top_center: {
          x: data[1] + (data[3] - data[1]) / 2,
          y: data[2] - 10
      },
  
      bottom_center: {
          x: data[1] + (data[3] - data[1]) / 2,
          y: data[2] + (data[4] - data[2]) + 10
      }
    };
}

const floortime = Math.floor(Globals.Realtime());
function roundedtime() {
    floortime = Math.floor(Globals.Realtime());
}
Cheat.RegisterCallback("Draw", "roundedtime")
const global_clock = floortime;
const sleep = function(time) {
    return global_clock + time == Math.floor(Globals.Realtime());
}

// Delay https://github.com/melifluous/onetap/blob/main/delay%20and%20interval%20functions/examples.js
function delay(callback, milliseconds) {
    const registeredSymbol = Symbol.for("isDelayRegistered?")
    const delayCallbacksSymbol = Symbol.for("delayCallbacks")

    if(typeof callback == "function" && typeof milliseconds == "number") {
        const delaySymbol = Symbol()

        if(!this[delayCallbacksSymbol])
            this[delayCallbacksSymbol] = {}

        this[delayCallbacksSymbol][delaySymbol] = { callback: callback, milliseconds: milliseconds, start: Date.now() }

        if(this[registeredSymbol] !== true) {
            this[registeredSymbol] = true

            Cheat.RegisterCallback("Draw", "delay")
        }

        return delaySymbol
    } else {
        const symbols = Object.getOwnPropertySymbols(this[delayCallbacksSymbol])

        for(var i = 0; i < symbols.length; i++) {
            const delayObject = this[delayCallbacksSymbol][symbols[i]]
            const difference = Date.now() - delayObject.start

            if(difference >= delayObject.milliseconds) {    
                delayObject.callback()

                delete this[delayCallbacksSymbol][symbols[i]]
            }
        }
    }
}

function clearDelay(intervalSymbol) {
    delete this[Symbol.for("delayCallbacks")][intervalSymbol]
}

function interval(callback, milliseconds, executeImmediately) {
    const isRegisteredSymbol = Symbol.for("isIntervalRegistered?")
    const intervalCallbacksSymbol = Symbol.for("intervalCallbacks")

    if(typeof callback == "function" && typeof milliseconds == "number") {
        const intervalSymbol = Symbol()

        if(!this[intervalCallbacksSymbol])
            this[intervalCallbacksSymbol] = {}

        if(executeImmediately === true)
            callback()

        this[intervalCallbacksSymbol][intervalSymbol] = { callback: callback, milliseconds: milliseconds, start: Date.now(), lastExecution: Date.now() }

        if(this[isRegisteredSymbol] !== true) {
            this[isRegisteredSymbol] = true

            Cheat.RegisterCallback("Draw", "interval")
        }

        return intervalSymbol
    } else {
        const symbols = Object.getOwnPropertySymbols(this[intervalCallbacksSymbol])

        for(var i = 0; i < symbols.length; i++) {
            const intervalObject = this[intervalCallbacksSymbol][symbols[i]]
            const difference = Date.now() - intervalObject.lastExecution

            if(difference >= intervalObject.milliseconds) {    
                intervalObject.callback()
                intervalObject.lastExecution += intervalObject.milliseconds
            }
        }
    }
}

function clearInterval(delaySymbol) {
    delete this[Symbol.for("intervalCallbacks")][delaySymbol]
}

// Variables
var screen_size = Render.GetScreenSize();
var screen_width = screen_size[0];
var screen_height = screen_size[1];
//var username = "[Release] " + Cheat.GetUsername();
var username = "[DEV] FutureDisaster"
const presetmode = ["Off", "Real Jitter", "Real Static", "Real Switch", "Fake Switch", "FutureSight", "Ideal Yaw", "Experiment 1" , "Custom"];
const weapon_group = ["General", "Auto", "Scout", "AWP", "Pistol", "Heavy Pistol"];
const custom_target = ["Default", "Lowest HP ( Not available for now )", "Highest Damage ( Not available for now )", "Lowest Distance"];
const head_cond = ["Standing", "Crouching", "Walking", "Running", "In-air", "On Shot ( Not available for now )"]
const baim_safe_cond = ["Standing", "Crouching", "Walking", "Running", "In-air", "Lethal X 1 ( Not available for now )", "Lethal X 2 ( Not available for now )"]
const safe_hitgroup = ["Head", "Chest", "Stomach", "Arms", "Legs", "Feet"]
const autostop_modifier = ["Duck", "Early", "On center only", "Lethal only", "Visible only", "In air", "Between shots", "Force accuracy"]

const ref_inverter = ["Rage", "Anti Aim", "General", "Key assignment", "AA direction inverter"];

var wep2index = {
    "g3sg1": 0,
    "g3sg1": 1,
    "scar 20": 2,
    "ssg 08": 3,
    "awp": 4,
    "usp s": 5,
    "glock 18": 6,
    "dual berettas": 7,
    "r8 revolver": 8,
    "desert eagle": 9,
    "p250": 10,
    "tec 9": 11,
    "mp9": 12,
    "mac 10": 13,
    "pp bizon": 14,
    "ump 45": 15,
    "ak 47": 16,
    "sg 553": 17,
    "aug": 18,
    "m4a1 s": 19,
    "m4a4": 20,
    "xm1014": 21,
    "mag 7": 22,
    "m249": 23,
    "negev": 24,
    "p2000": 25,
    "famas": 26,
    "five seven": 27,
    "mp7": 28,
    "p90": 29,
    "cz75 auto": 30,
    "mp5 sd": 31,
    "galil ar": 32,
    "sawed off": 33,
}

var weplist = ["General",
    "G3SG1",
    "SCAR20",
    "SSG08",
    "AWP",
    "USP",
    "Glock",
    "Dualies",
    "Revolver",
    "Deagle",
    "P250",
    "Tec-9",
    "MP9",
    "Mac10",
    "PP-Bizon",
    "UMP45",
    "AK47",
    "SG553",
    "AUG",
    "M4A1-S",
    "M4A4",
    "XM1014",
    "MAG7",
    "M249",
    "Negev",
    "P2000",
    "FAMAS",
    "Five Seven",
    "MP7",
    "P90",
    "CZ-75",
    "MP5",
    "GALIL",
    "Sawed off"
];

var weapon_config = 0;
var noscope_opt = 0;
var enemies = [];


const ent_Local = {
    id: 0,
    is_scoped: false,
    weapon_id: 0,
    weapon_name: "",
    weapon_group: 0,

    Update: function () {
        this.id = Entity.GetLocalPlayer();
        this.is_scoped = Entity.GetProp(this.id, "CCSPlayer", "m_bIsScoped");

        this.weapon_id = Entity.GetWeapon(this.id);
        this.weapon_name = Entity.GetName(this.weapon_id);

        if (this.weapon_name == "g3sg1" || this.weapon_name == "scar 20") {
            this.weapon_group = 1
        } else if (this.weapon_name == "ssg 08") {
            this.weapon_group = 2
        } else if (this.weapon_name == "awp") {
            this.weapon_group = 3
        } else if (this.weapon_name == "glock 18" || this.weapon_name == "dual berettas" || this.weapon_name == "p250" || this.weapon_name == "tec 9" || this.weapon_name == "p2000" || this.weapon_name == "five seven" || this.weapon_name == "usp s" || this.weapon_name == "cz75 auto") {
            this.weapon_group = 4
        } else if (this.weapon_name == "desert eagle" || this.weapon_name == "r8 revolver") {
            this.weapon_group = 5
        } else {
            this.weapon_group = 0
        }

        //Cheat.Print(this.weapon_name.toString() + "\n");
    },

}

const ent_Target = {
    target: null,
    freestandside: 0,
    last_freestandside: 0,
    distance: 0,

    Update: function () {
        if (!Ragebot.GetTarget()) {
            this.target = closestTarget();
        } else {
            this.target = Ragebot.GetTarget();
        }

        this.distance = get_metric_distance(Entity.GetRenderOrigin(ent_Local.id), Entity.GetRenderOrigin(this.target));
    },
}

// Cache Variable
const watermark_cache = UI.GetValue(["Misc.", "Helpers", "General", "Watermark"]);
const keybind_cache = UI.GetValue(["Misc.", "Helpers", "General", "Show keybind states"]);
const spectator_cache = UI.GetValue(["Misc.", "Helpers", "General", "Show spectators"]);

const restrictions_cache = UI.GetValue(["Config", "Cheat", "General", "Restrictions"]);
const yaw_cache = UI.GetValue(["Rage", "Anti Aim", "Directions", "Yaw offset"]);
const pitch_cache = UI.GetValue(["Rage", "Anti Aim", "General", "Pitch mode"]);

// Subtabs
UI.AddSubTab(["Rage", "SUBTAB_MGR"], "-------------------")
UI.AddSubTab(["Rage", "SUBTAB_MGR"], "Rage Disaster")
UI.AddSubTab(["Rage", "SUBTAB_MGR"], "Advanced Config")
UI.AddSubTab(["Rage", "SUBTAB_MGR"], "AA Disaster")

UI.AddSubTab(["Visuals", "SUBTAB_MGR"], "-------------------")
UI.AddSubTab(["Visuals", "SUBTAB_MGR"], "Visual Disaster")
UI.AddSubTab(["Visuals", "SUBTAB_MGR"], "Custom Chams")

UI.AddSubTab(["Misc.", "SUBTAB_MGR"], "-------------------")
UI.AddSubTab(["Misc.", "SUBTAB_MGR"], "Misc Disaster")

// Path address
const rage_path = ["Rage", "Rage Disaster", "Rage Disaster"]
const cfg_path = ["Rage", "Advanced Config", "Advanced Config"]
const key_rage_path = ["Rage", "General", "General", "Key assignment"]
const aa_path = ["Rage", "AA Disaster", "AA Disaster"]
const key_aa_path = ["Rage", "Anti Aim", "General", "Key assignment"]
const visuals_path = ["Visuals", "Visual Disaster", "Visual Disaster"]
const chams_path = ["Visuals", "Custom Chams", "Custom Chams"]
const misc_path = ["Misc.", "Misc Disaster", "Misc Disaster"]

// UI var
const UI_List = {
    checkbox_overrideDT: UI.AddCheckbox(rage_path, "Override DT"),
    dropdown_dtmode: UI.AddDropdown(rage_path, "DT Mode", ["Disaster", "Fast", "Normal"], 0),
    checkbox_delay: UI.AddCheckbox(rage_path, "Delay (Tolerance 1)"),
    checkbox_fastrecharge: UI.AddCheckbox(rage_path, "Override Recharge"),
    slider_rechargetimer : UI.AddSliderInt( rage_path, "Recharge Timer", 0, 18 ),

    checkbox_zeusfl: UI.AddCheckbox(rage_path, "Fakelag on zeus"),

    //------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    checkbox_advancecfg: UI.AddCheckbox(cfg_path, "Advanced Config"),
    checkbox_syncmenu: UI.AddCheckbox(cfg_path, "Sync Menu W/ Weapon"),
    dropdown_weaponconfig: UI.AddDropdown(cfg_path, "Weapon Config", weplist, 0),

    key_overrideHC: UI.AddHotkey(key_rage_path, "Hitchance override", "Hitchance override"),

    //------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    dropdown_presetAA: UI.AddDropdown(aa_path, "Preset AA", presetmode, 0),
    dropdown_custommode: UI.AddDropdown(aa_path, "Custom Mode", ["Static", "Switch", "Random (Second > First)"], 0),
    
    slider_real                     : UI.AddSliderInt( aa_path, "Real", -180, 180 ),
    slider_fake                     : UI.AddSliderInt( aa_path, "Fake", -180, 180 ),
    slider_lby                      : UI.AddSliderInt( aa_path, "Lby", -180, 180 ),

    slider_real2                    : UI.AddSliderInt( aa_path, "Real 2", -180, 180 ),
    slider_fake2                    : UI.AddSliderInt( aa_path, "Fake 2", -180, 180 ),
    slider_lby2                     : UI.AddSliderInt( aa_path, "Lby 2", -180, 180 ),

    slider_delay                    : UI.AddSliderFloat( aa_path, "Switch Delay", 0.10, 4.00 ),
    

    dropdown_bodyfreestanding: UI.AddDropdown(aa_path, "Advanced Freestanding", ["Off", "Hide", "Peek"], 0),
    dropdown_freestandtarget: UI.AddDropdown(aa_path, "Freestanding Target", ["Crosshair", "Distance"], 0),

    checkbox_lowdelta: UI.AddCheckbox(aa_path, "Low Delta"),
    dropdown_lowdelta: UI.AddDropdown(aa_path, "Low Delta On", ["Test 1", "Test 2", "Test 3", "Test 4", "Test 5"], 0),
    key_lowdelta: UI.AddHotkey(key_aa_path, "Low Delta", "Low Delta"),

    dropdown_autodir_disabler: UI.AddMultiDropdown(aa_path, "Auto Direction Disabler", ["Standing", "Slow walking", "In air", "Legit AA"]),

    checkbox_customslowwalk: UI.AddCheckbox(aa_path, "Custom Slow-walk"),
    slider_sspeed : UI.AddSliderInt( aa_path, "Speed", 0, 100 ),

    key_legitaa: UI.AddHotkey(key_aa_path, "Legit AA", "Legit AA"),
    key_idealtick: UI.AddHotkey(key_aa_path, "Ideal Tick", "Ideal Tick"),
    key_autodir: UI.AddHotkey(key_aa_path, "Auto Direction", "Auto Direction"),

    //------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    multidrop_renderflags: UI.AddMultiDropdown(visuals_path, "Render Flag", ["Noscope", "Standing", "In-air", "Crouch", "Slow-walk", "Moving", "Force Baim", "Force Safe"]),
    colorpicker_renderflags: UI.AddColorPicker(visuals_path, "Render Color"),

    multidrop_customflags: UI.AddMultiDropdown(visuals_path, "Esp Flag", ["Noscope"]),
    colorpicker_noscopeflag: UI.AddColorPicker(visuals_path, "Noscope Flag Color"),

    checkbox_watermark: UI.AddCheckbox(visuals_path, "Watermark"),
    colorpicker1_watermark: UI.AddColorPicker(visuals_path, "Watermark Color 1"),
    colorpicker2_watermark: UI.AddColorPicker(visuals_path, "Watermark Color 2"),
    colorpicker3_watermark: UI.AddColorPicker(visuals_path, "Watermark Icon Color"),
    colorpicker4_watermark: UI.AddColorPicker(visuals_path, "Watermark Font Color"),
    sliderX_watermark: UI.AddSliderInt(visuals_path, "Watermark-X", 0, screen_width),
    sliderY_watermark: UI.AddSliderInt(visuals_path, "Watermark-Y", 0, screen_height),

    checkbox_keybind: UI.AddCheckbox(visuals_path, "Keybind"),
    colorpicker1_keybind: UI.AddColorPicker(visuals_path, "Keybind Color 1"),
    colorpicker2_keybind: UI.AddColorPicker(visuals_path, "Keybind Color 2"),
    colorpicker3_keybind: UI.AddColorPicker(visuals_path, "Keybind Title Color"),
    colorpicker4_keybind: UI.AddColorPicker(visuals_path, "Keybind Icon Color 1"),
    colorpicker5_keybind: UI.AddColorPicker(visuals_path, "Keybind Icon Color 2"),
    colorpicker6_keybind: UI.AddColorPicker(visuals_path, "Keybind Content Color"),
    sliderX_keybind: UI.AddSliderInt(visuals_path, "Keybind-X", 0, screen_width),
    sliderY_keybind: UI.AddSliderInt(visuals_path, "Keybind-Y", 0, screen_height),

    checkbox_spectator: UI.AddCheckbox(visuals_path, "Spectator"),
    colorpicker1_spectator: UI.AddColorPicker(visuals_path, "Spectator Color 1"),
    colorpicker2_spectator: UI.AddColorPicker(visuals_path, "Spectator Color 2"),
    colorpicker3_spectator: UI.AddColorPicker(visuals_path, "Spectator Title Color"),
    colorpicker4_spectator: UI.AddColorPicker(visuals_path, "Spectator Icon Color 1"),
    colorpicker5_spectator: UI.AddColorPicker(visuals_path, "Spectator Icon Color 2"),
    colorpicker6_spectator: UI.AddColorPicker(visuals_path, "Spectator Content Color"),
    sliderX_spectator: UI.AddSliderInt(visuals_path, "Spectator-X", 0, screen_width),
    sliderY_spectator: UI.AddSliderInt(visuals_path, "Spectator-Y", 0, screen_height),

    checkbox_crosshair: UI.AddCheckbox(visuals_path, "Crosshair"),
    colorpicker1_crosshair: UI.AddColorPicker(visuals_path, "Crosshair Color 1"),
    colorpicker2_crosshair: UI.AddColorPicker(visuals_path, "Crosshair Color 2"),
    slider_length: UI.AddSliderInt(visuals_path, "Length", 0, 500),
    slider_width: UI.AddSliderInt(visuals_path, "Width", 0, 30),
    slider_offset: UI.AddSliderInt(visuals_path, "Offset", 0, 500),

    checkbox_indicator: UI.AddCheckbox(visuals_path, "Indicator"),
    colorpicker7_indicator: UI.AddColorPicker(visuals_path, "Indicator Real Arrow"),
    colorpicker8_indicator: UI.AddColorPicker(visuals_path, "Indicator Fake Arrow"),
    colorpicker1_indicator: UI.AddColorPicker(visuals_path, "Indicator Title Color"),
    colorpicker4_indicator: UI.AddColorPicker(visuals_path, "Indicator AA Mode Color"),
    colorpicker5_indicator: UI.AddColorPicker(visuals_path, "Indicator Desync Bar 1"),
    colorpicker6_indicator: UI.AddColorPicker(visuals_path, "Indicator Desync Bar 2"),
    colorpicker2_indicator: UI.AddColorPicker(visuals_path, "Indicator Enabled Color"),
    colorpicker3_indicator: UI.AddColorPicker(visuals_path, "Indicator Disabled Color"),

    checkbox_tstrike: UI.AddCheckbox(visuals_path, "Thunderstrike On Hit"),

    checkbox_holopanel: UI.AddCheckbox(visuals_path, "Holopanel"),
    colorpicker_border: UI.AddColorPicker(visuals_path, "Border Color"),

    colorpicker_title: UI.AddColorPicker(visuals_path, "Title Color"),

    colorpicker_desync: UI.AddColorPicker(visuals_path, "Desync Title Color"),
    colorpicker_desync_value: UI.AddColorPicker(visuals_path, "Desync Value Color"),

    colorpicker_invert: UI.AddColorPicker(visuals_path, "Invert Title Color"),
    colorpicker_invert_value: UI.AddColorPicker(visuals_path, "Invert Value Color"),

    colorpicker_choke: UI.AddColorPicker(visuals_path, "Choke Title Color"),
    colorpicker_choke_value: UI.AddColorPicker(visuals_path, "Choke Value Color"),

    colorpicker_dt_title: UI.AddColorPicker(visuals_path, "DT Title Color"),
    colorpicker_dt_weapon: UI.AddColorPicker(visuals_path, "Weapon Icon Color"),
    colorpicker_dt_bullet: UI.AddColorPicker(visuals_path, "Bullet Color"),

    colorpicker_hideshot: UI.AddColorPicker(visuals_path, "Hideshots Title Color"),
    colorpicker_hideshot_value: UI.AddColorPicker(visuals_path, "Hideshots Value Color"),

    sliderX_holopanel: UI.AddSliderInt(visuals_path, "Holopanel-X", 0, screen_width),
    sliderY_holopanel: UI.AddSliderInt(visuals_path, "Holopanel-Y", 0, screen_height),

    //------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    checkbox_customchams: UI.AddCheckbox(chams_path, "Custom Chams"),
    dropdown_player: UI.AddDropdown(chams_path, "Local/Enemy", ["Local", "Enemy"], 0),
    dropdown_local_part: UI.AddDropdown(chams_path, "Local - Configured Model", ["Visible", "Attachments", "Desync", "Fakelag", "Arms", "Weapon"], 0),
    dropdown_enemy_part: UI.AddDropdown(chams_path, "Enemy - Configured Model", ["Visible", "Hidden", "Attachments", "History"], 0),

    colorpicker_self_visible: UI.AddColorPicker(chams_path, "Local - Visible"),
    slider_self_intensity_visible: UI.AddSliderInt(chams_path, "Local Intensity - Visible", 0, 100),

    colorpicker_self_attachments: UI.AddColorPicker(chams_path, "Local - Attachments"),
    slider_self_intensity_attachments: UI.AddSliderInt(chams_path, "Local Intensity - Attachments", 0, 100),

    colorpicker_self_desync: UI.AddColorPicker(chams_path, "Local - Desync"),
    slider_self_intensity_desync: UI.AddSliderInt(chams_path, "Local Intensity - Desync", 0, 100),

    colorpicker_self_fakelag: UI.AddColorPicker(chams_path, "Local - Fakelag"),
    slider_self_intensity_fakelag: UI.AddSliderInt(chams_path, "Local Intensity - Fakelag", 0, 100),

    colorpicker_self_arms: UI.AddColorPicker(chams_path, "Local - Arms"),
    slider_self_intensity_arms: UI.AddSliderInt(chams_path, "Local Intensity - Arms", 0, 100),

    colorpicker_self_weapon: UI.AddColorPicker(chams_path, "Local - Weapon"),
    slider_self_intensity_weapon: UI.AddSliderInt(chams_path, "Local Intensity - Weapon", 0, 100),

    colorpicker_enemy_visible: UI.AddColorPicker(chams_path, "Enemy - Visible"),
    slider_enemy_intensity_visible: UI.AddSliderInt(chams_path, "Enemy Intensity - Visible", 0, 100),

    colorpicker_enemy_hidden: UI.AddColorPicker(chams_path, "Enemy - Hidden"),
    slider_enemy_intensity_hidden: UI.AddSliderInt(chams_path, "Enemy Intensity - Hidden", 0, 100),

    colorpicker_enemy_attachments: UI.AddColorPicker(chams_path, "Enemy - Attachments"),
    slider_enemy_intensity_attachments: UI.AddSliderInt(chams_path, "Enemy Intensity - Attachments", 0, 100),

    colorpicker_enemy_history: UI.AddColorPicker(chams_path, "Enemy - History"),
    slider_enemy_intensity_history: UI.AddSliderInt(chams_path, "Enemy Intensity - History", 0, 100),

    /*
    slider_self_intensity: UI.AddSliderInt(chams_path, "Self Intensity", 0, 100),
    slider_enemy_intensity: UI.AddSliderInt(chams_path, "Enemy Intensity", 0, 100),
    colorpicker_self: UI.AddColorPicker(chams_path, "Self Color"),
    colorpicker_enemy: UI.AddColorPicker(chams_path, "Enemy Color"),
    */

    //------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    multidrop_logtype: UI.AddMultiDropdown(misc_path, "Log", ["DT Speed", "Damage", "Hurt"]),
    checkbox_logonchat: UI.AddCheckbox(misc_path, "Hitlog on chat"),
    colorpicker_dt: UI.AddColorPicker(misc_path, "DT Speed Log Color"),
    colorpicker_hit: UI.AddColorPicker(misc_path, "Hit Log Color"),
    colorpicker_hurt: UI.AddColorPicker(misc_path, "Hurt Log Color"),

    checkbox_clantag: UI.AddCheckbox(misc_path, "Clantag"),
    dropdown_clantag: UI.AddDropdown(misc_path, "Clantag Type", ["Disaster"], 0),

    slider_aspectratio: UI.AddSliderFloat(misc_path, "Aspect Ratio", 0.00, 5.00),

    dropdown_killsay: UI.AddDropdown(misc_path, "Killsay", ["Off", "Promoting", "Future Disaster", "FPS", "Time", "Weapon", "DLLM"], 0),
    checkbox_include_name: UI.AddCheckbox(misc_path, "Include enemy name"),

    checkbox_consolefilter: UI.AddCheckbox(misc_path, "Console Filter"),

    checkbox_legspam: UI.AddCheckbox(misc_path, "Leg Spam"),

    //------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    UI_control: function () {
        UI.SetEnabled(this.dropdown_dtmode, UI.GetValue(this.checkbox_overrideDT) ? 1 : 0);
        UI.SetEnabled(this.checkbox_delay, UI.GetValue(this.checkbox_overrideDT) ? 1 : 0);

        UI.SetEnabled(this.slider_rechargetimer, UI.GetValue(this.checkbox_fastrecharge) ? 1 : 0);

        //------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        UI.SetEnabled(this.dropdown_weaponconfig, UI.GetValue(this.checkbox_advancecfg) ? 1 : 0);
        UI.SetEnabled(this.checkbox_syncmenu, UI.GetValue(this.checkbox_advancecfg) ? 1 : 0);

        //------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        UI.SetEnabled(this.dropdown_custommode, UI.GetValue(this.dropdown_presetAA) == 8 ? 1 : 0);

        UI.SetEnabled(this.slider_real, UI.GetValue(this.dropdown_presetAA) == 8 ? 1 : 0);
        UI.SetEnabled(this.slider_fake, UI.GetValue(this.dropdown_presetAA) == 8 ? 1 : 0);
        UI.SetEnabled(this.slider_lby, UI.GetValue(this.dropdown_presetAA) == 8 ? 1 : 0);

        if( (( UI.GetValue(this.dropdown_presetAA) == 8 ) && ( UI.GetValue(this.dropdown_custommode) == 1 )) || ( UI.GetValue(this.dropdown_presetAA) == 8 ) && ( UI.GetValue(this.dropdown_custommode) == 2 ) )
        {
            UI.SetEnabled(this.slider_real2, 1);
            UI.SetEnabled(this.slider_fake2, 1);
            UI.SetEnabled(this.slider_lby2, 1);

            if(UI.GetValue(this.dropdown_custommode) == 1)
            {
                UI.SetEnabled(this.slider_delay, 1);
            }
            else
            {
                UI.SetEnabled(this.slider_delay, 0);
            }
        }
        else
        {
            UI.SetEnabled(this.slider_real2, 0);
            UI.SetEnabled(this.slider_fake2, 0);
            UI.SetEnabled(this.slider_lby2, 0);
            UI.SetEnabled(this.slider_delay, 0);
        }
        

        UI.SetEnabled(this.dropdown_lowdelta, UI.GetValue(this.checkbox_lowdelta) ? 1 : 0);

        UI.SetEnabled(this.dropdown_freestandtarget, UI.GetValue(this.dropdown_bodyfreestanding) != 0 ? 1 : 0);
        
        UI.SetEnabled(this.slider_sspeed, UI.GetValue(this.checkbox_customslowwalk) ? 1 : 0);

        //------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        UI.SetEnabled(this.colorpicker_renderflags, (UI.GetValue(UI_List.multidrop_renderflags) & 1 << 0) ? 1 : 0);

        UI.SetEnabled(this.colorpicker_noscopeflag, (UI.GetValue(UI_List.multidrop_customflags) & 1 << 0) ? 1 : 0);

        UI.SetValue(["Misc.", "Helpers", "General", "Watermark"], UI.GetValue(this.checkbox_watermark) ? 0 : watermark_cache);
        UI.SetEnabled(this.colorpicker1_watermark, UI.GetValue(this.checkbox_watermark) ? 1 : 0);
        UI.SetEnabled(this.colorpicker2_watermark, UI.GetValue(this.checkbox_watermark) ? 1 : 0);
        UI.SetEnabled(this.colorpicker3_watermark, UI.GetValue(this.checkbox_watermark) ? 1 : 0);
        UI.SetEnabled(this.colorpicker4_watermark, UI.GetValue(this.checkbox_watermark) ? 1 : 0);
        UI.SetEnabled(this.sliderX_watermark, UI.GetValue(this.checkbox_watermark) ? 1 : 0);
        UI.SetEnabled(this.sliderY_watermark, UI.GetValue(this.checkbox_watermark) ? 1 : 0);

        UI.SetValue(["Misc.", "Helpers", "General", "Show keybind states"], UI.GetValue(this.checkbox_keybind) ? 0 : keybind_cache);
        UI.SetEnabled(this.colorpicker1_keybind, UI.GetValue(this.checkbox_keybind) ? 1 : 0);
        UI.SetEnabled(this.colorpicker2_keybind, UI.GetValue(this.checkbox_keybind) ? 1 : 0);
        UI.SetEnabled(this.colorpicker3_keybind, UI.GetValue(this.checkbox_keybind) ? 1 : 0);
        UI.SetEnabled(this.colorpicker4_keybind, UI.GetValue(this.checkbox_keybind) ? 1 : 0);
        UI.SetEnabled(this.colorpicker5_keybind, UI.GetValue(this.checkbox_keybind) ? 1 : 0);
        UI.SetEnabled(this.colorpicker6_keybind, UI.GetValue(this.checkbox_keybind) ? 1 : 0);
        UI.SetEnabled(this.sliderX_keybind, UI.GetValue(this.checkbox_keybind) ? 1 : 0);
        UI.SetEnabled(this.sliderY_keybind, UI.GetValue(this.checkbox_keybind) ? 1 : 0);

        UI.SetValue(["Misc.", "Helpers", "General", "Show spectators"], UI.GetValue(this.checkbox_spectator) ? 0 : spectator_cache);
        UI.SetEnabled(this.colorpicker1_spectator, UI.GetValue(this.checkbox_spectator) ? 1 : 0);
        UI.SetEnabled(this.colorpicker2_spectator, UI.GetValue(this.checkbox_spectator) ? 1 : 0);
        UI.SetEnabled(this.colorpicker3_spectator, UI.GetValue(this.checkbox_spectator) ? 1 : 0);
        UI.SetEnabled(this.colorpicker4_spectator, UI.GetValue(this.checkbox_spectator) ? 1 : 0);
        UI.SetEnabled(this.colorpicker5_spectator, UI.GetValue(this.checkbox_spectator) ? 1 : 0);
        UI.SetEnabled(this.colorpicker6_spectator, UI.GetValue(this.checkbox_spectator) ? 1 : 0);
        UI.SetEnabled(this.sliderX_spectator, UI.GetValue(this.checkbox_spectator) ? 1 : 0);
        UI.SetEnabled(this.sliderY_spectator, UI.GetValue(this.checkbox_spectator) ? 1 : 0);

        UI.SetEnabled(this.colorpicker1_crosshair, UI.GetValue(this.checkbox_crosshair) ? 1 : 0);
        UI.SetEnabled(this.colorpicker2_crosshair, UI.GetValue(this.checkbox_crosshair) ? 1 : 0);
        UI.SetEnabled(this.slider_length, UI.GetValue(this.checkbox_crosshair) ? 1 : 0);
        UI.SetEnabled(this.slider_width, UI.GetValue(this.checkbox_crosshair) ? 1 : 0);
        UI.SetEnabled(this.slider_offset, UI.GetValue(this.checkbox_crosshair) ? 1 : 0);

        UI.SetEnabled(this.colorpicker1_indicator, UI.GetValue(this.checkbox_indicator) ? 1 : 0);
        UI.SetEnabled(this.colorpicker2_indicator, UI.GetValue(this.checkbox_indicator) ? 1 : 0);
        UI.SetEnabled(this.colorpicker3_indicator, UI.GetValue(this.checkbox_indicator) ? 1 : 0);
        UI.SetEnabled(this.colorpicker4_indicator, UI.GetValue(this.checkbox_indicator) ? 1 : 0);
        UI.SetEnabled(this.colorpicker5_indicator, UI.GetValue(this.checkbox_indicator) ? 1 : 0);
        UI.SetEnabled(this.colorpicker6_indicator, UI.GetValue(this.checkbox_indicator) ? 1 : 0);
        UI.SetEnabled(this.colorpicker7_indicator, UI.GetValue(this.checkbox_indicator) ? 1 : 0);
        UI.SetEnabled(this.colorpicker8_indicator, UI.GetValue(this.checkbox_indicator) ? 1 : 0);

        UI.SetEnabled(this.colorpicker_border, UI.GetValue(this.checkbox_holopanel) ? 1 : 0);

        UI.SetEnabled(this.colorpicker_title, UI.GetValue(this.checkbox_holopanel) ? 1 : 0);
        
        UI.SetEnabled(this.colorpicker_desync, UI.GetValue(this.checkbox_holopanel) ? 1 : 0);
        UI.SetEnabled(this.colorpicker_desync_value, UI.GetValue(this.checkbox_holopanel) ? 1 : 0);

        UI.SetEnabled(this.colorpicker_invert, UI.GetValue(this.checkbox_holopanel) ? 1 : 0);
        UI.SetEnabled(this.colorpicker_invert_value, UI.GetValue(this.checkbox_holopanel) ? 1 : 0);

        UI.SetEnabled(this.colorpicker_choke, UI.GetValue(this.checkbox_holopanel) ? 1 : 0);
        UI.SetEnabled(this.colorpicker_choke_value, UI.GetValue(this.checkbox_holopanel) ? 1 : 0);

        UI.SetEnabled(this.colorpicker_dt_title, UI.GetValue(this.checkbox_holopanel) ? 1 : 0);
        UI.SetEnabled(this.colorpicker_dt_weapon, UI.GetValue(this.checkbox_holopanel) ? 1 : 0);
        UI.SetEnabled(this.colorpicker_dt_bullet, UI.GetValue(this.checkbox_holopanel) ? 1 : 0);

        UI.SetEnabled(this.colorpicker_hideshot, UI.GetValue(this.checkbox_holopanel) ? 1 : 0);
        UI.SetEnabled(this.colorpicker_hideshot_value, UI.GetValue(this.checkbox_holopanel) ? 1 : 0);

        UI.SetEnabled(this.sliderX_holopanel, UI.GetValue(this.checkbox_holopanel) ? 1 : 0);
        UI.SetEnabled(this.sliderY_holopanel, UI.GetValue(this.checkbox_holopanel) ? 1 : 0);
        
        //------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

        UI.SetEnabled(this.dropdown_player, UI.GetValue(this.checkbox_customchams) ? 1 : 0);

        if(UI.GetValue(this.checkbox_customchams))
        {
            if(UI.GetValue(this.dropdown_player) == 0)
            {
                UI.SetEnabled(this.dropdown_local_part, 1);
                UI.SetEnabled(this.dropdown_enemy_part, 0);

                //-----------------------------------------------------------

                UI.SetEnabled(this.colorpicker_enemy_visible, 0);
                UI.SetEnabled(this.slider_enemy_intensity_visible, 0);

                UI.SetEnabled(this.colorpicker_enemy_hidden, 0);
                UI.SetEnabled(this.slider_enemy_intensity_hidden, 0);

                UI.SetEnabled(this.colorpicker_enemy_attachments, 0);
                UI.SetEnabled(this.slider_enemy_intensity_attachments, 0);

                UI.SetEnabled(this.colorpicker_enemy_history, 0);
                UI.SetEnabled(this.slider_enemy_intensity_history, 0);

                //-----------------------------------------------------------

                if(UI.GetValue(this.dropdown_local_part) == 0)
                {
                    UI.SetEnabled(this.colorpicker_self_visible, 1);
                    UI.SetEnabled(this.slider_self_intensity_visible, 1);
                    
                    UI.SetEnabled(this.colorpicker_self_attachments, 0);
                    UI.SetEnabled(this.slider_self_intensity_attachments, 0);

                    UI.SetEnabled(this.colorpicker_self_desync, 0);
                    UI.SetEnabled(this.slider_self_intensity_desync, 0);
                    
                    UI.SetEnabled(this.colorpicker_self_fakelag, 0);
                    UI.SetEnabled(this.slider_self_intensity_fakelag, 0);

                    UI.SetEnabled(this.colorpicker_self_arms, 0);
                    UI.SetEnabled(this.slider_self_intensity_arms, 0);

                    UI.SetEnabled(this.colorpicker_self_weapon, 0);
                    UI.SetEnabled(this.slider_self_intensity_weapon, 0);
                }
                else if (UI.GetValue(this.dropdown_local_part) == 1)
                {
                    UI.SetEnabled(this.colorpicker_self_visible, 0);
                    UI.SetEnabled(this.slider_self_intensity_visible, 0);
                    
                    UI.SetEnabled(this.colorpicker_self_attachments, 1);
                    UI.SetEnabled(this.slider_self_intensity_attachments, 1);

                    UI.SetEnabled(this.colorpicker_self_desync, 0);
                    UI.SetEnabled(this.slider_self_intensity_desync, 0);
                    
                    UI.SetEnabled(this.colorpicker_self_fakelag, 0);
                    UI.SetEnabled(this.slider_self_intensity_fakelag, 0);

                    UI.SetEnabled(this.colorpicker_self_arms, 0);
                    UI.SetEnabled(this.slider_self_intensity_arms, 0);

                    UI.SetEnabled(this.colorpicker_self_weapon, 0);
                    UI.SetEnabled(this.slider_self_intensity_weapon, 0);
                }
                else if (UI.GetValue(this.dropdown_local_part) == 2)
                {
                    UI.SetEnabled(this.colorpicker_self_visible, 0);
                    UI.SetEnabled(this.slider_self_intensity_visible, 0);
                    
                    UI.SetEnabled(this.colorpicker_self_attachments, 0);
                    UI.SetEnabled(this.slider_self_intensity_attachments, 0);

                    UI.SetEnabled(this.colorpicker_self_desync, 1);
                    UI.SetEnabled(this.slider_self_intensity_desync, 1);
                    
                    UI.SetEnabled(this.colorpicker_self_fakelag, 0);
                    UI.SetEnabled(this.slider_self_intensity_fakelag, 0);

                    UI.SetEnabled(this.colorpicker_self_arms, 0);
                    UI.SetEnabled(this.slider_self_intensity_arms, 0);

                    UI.SetEnabled(this.colorpicker_self_weapon, 0);
                    UI.SetEnabled(this.slider_self_intensity_weapon, 0);
                }
                else if (UI.GetValue(this.dropdown_local_part) == 3)
                {
                    UI.SetEnabled(this.colorpicker_self_visible, 0);
                    UI.SetEnabled(this.slider_self_intensity_visible, 0);
                    
                    UI.SetEnabled(this.colorpicker_self_attachments, 0);
                    UI.SetEnabled(this.slider_self_intensity_attachments, 0);

                    UI.SetEnabled(this.colorpicker_self_desync, 0);
                    UI.SetEnabled(this.slider_self_intensity_desync, 0);
                    
                    UI.SetEnabled(this.colorpicker_self_fakelag, 1);
                    UI.SetEnabled(this.slider_self_intensity_fakelag, 1);

                    UI.SetEnabled(this.colorpicker_self_arms, 0);
                    UI.SetEnabled(this.slider_self_intensity_arms, 0);

                    UI.SetEnabled(this.colorpicker_self_weapon, 0);
                    UI.SetEnabled(this.slider_self_intensity_weapon, 0);
                }
                else if (UI.GetValue(this.dropdown_local_part) == 4)
                {
                    UI.SetEnabled(this.colorpicker_self_visible, 0);
                    UI.SetEnabled(this.slider_self_intensity_visible, 0);
                    
                    UI.SetEnabled(this.colorpicker_self_attachments, 0);
                    UI.SetEnabled(this.slider_self_intensity_attachments, 0);

                    UI.SetEnabled(this.colorpicker_self_desync, 0);
                    UI.SetEnabled(this.slider_self_intensity_desync, 0);
                    
                    UI.SetEnabled(this.colorpicker_self_fakelag, 0);
                    UI.SetEnabled(this.slider_self_intensity_fakelag, 0);

                    UI.SetEnabled(this.colorpicker_self_arms, 1);
                    UI.SetEnabled(this.slider_self_intensity_arms, 1);

                    UI.SetEnabled(this.colorpicker_self_weapon, 0);
                    UI.SetEnabled(this.slider_self_intensity_weapon, 0);
                }
                else if (UI.GetValue(this.dropdown_local_part) == 5)
                {
                    UI.SetEnabled(this.colorpicker_self_visible, 0);
                    UI.SetEnabled(this.slider_self_intensity_visible, 0);
                    
                    UI.SetEnabled(this.colorpicker_self_attachments, 0);
                    UI.SetEnabled(this.slider_self_intensity_attachments, 0);

                    UI.SetEnabled(this.colorpicker_self_desync, 0);
                    UI.SetEnabled(this.slider_self_intensity_desync, 0);
                    
                    UI.SetEnabled(this.colorpicker_self_fakelag, 0);
                    UI.SetEnabled(this.slider_self_intensity_fakelag, 0);

                    UI.SetEnabled(this.colorpicker_self_arms, 0);
                    UI.SetEnabled(this.slider_self_intensity_arms, 0);

                    UI.SetEnabled(this.colorpicker_self_weapon, 1);
                    UI.SetEnabled(this.slider_self_intensity_weapon, 1);
                }
            }
            else if(UI.GetValue(this.dropdown_player) == 1)
            {
                UI.SetEnabled(this.dropdown_local_part, 0);
                UI.SetEnabled(this.dropdown_enemy_part, 1);

                //-----------------------------------------------------------

                UI.SetEnabled(this.colorpicker_self_visible, 0);
                UI.SetEnabled(this.slider_self_intensity_visible, 0);
                        
                UI.SetEnabled(this.colorpicker_self_attachments, 0);
                UI.SetEnabled(this.slider_self_intensity_attachments, 0);

                UI.SetEnabled(this.colorpicker_self_desync, 0);
                UI.SetEnabled(this.slider_self_intensity_desync, 0);
                        
                UI.SetEnabled(this.colorpicker_self_fakelag, 0);
                UI.SetEnabled(this.slider_self_intensity_fakelag, 0);

                UI.SetEnabled(this.colorpicker_self_arms, 0);
                UI.SetEnabled(this.slider_self_intensity_arms, 0);

                UI.SetEnabled(this.colorpicker_self_weapon, 0);
                UI.SetEnabled(this.slider_self_intensity_weapon, 0);

                //-----------------------------------------------------------

                if(UI.GetValue(this.dropdown_enemy_part) == 0)
                {
                    UI.SetEnabled(this.colorpicker_enemy_visible, 1);
                    UI.SetEnabled(this.slider_enemy_intensity_visible, 1);

                    UI.SetEnabled(this.colorpicker_enemy_hidden, 0);
                    UI.SetEnabled(this.slider_enemy_intensity_hidden, 0);

                    UI.SetEnabled(this.colorpicker_enemy_attachments, 0);
                    UI.SetEnabled(this.slider_enemy_intensity_attachments, 0);

                    UI.SetEnabled(this.colorpicker_enemy_history, 0);
                    UI.SetEnabled(this.slider_enemy_intensity_history, 0);
                }
                else if(UI.GetValue(this.dropdown_enemy_part) == 1)
                {
                    UI.SetEnabled(this.colorpicker_enemy_visible, 0);
                    UI.SetEnabled(this.slider_enemy_intensity_visible, 0);

                    UI.SetEnabled(this.colorpicker_enemy_hidden, 1);
                    UI.SetEnabled(this.slider_enemy_intensity_hidden, 1);

                    UI.SetEnabled(this.colorpicker_enemy_attachments, 0);
                    UI.SetEnabled(this.slider_enemy_intensity_attachments, 0);

                    UI.SetEnabled(this.colorpicker_enemy_history, 0);
                    UI.SetEnabled(this.slider_enemy_intensity_history, 0);
                }
                else if(UI.GetValue(this.dropdown_enemy_part) == 2)
                {
                    UI.SetEnabled(this.colorpicker_enemy_visible, 0);
                    UI.SetEnabled(this.slider_enemy_intensity_visible, 0);

                    UI.SetEnabled(this.colorpicker_enemy_hidden, 0);
                    UI.SetEnabled(this.slider_enemy_intensity_hidden, 0);

                    UI.SetEnabled(this.colorpicker_enemy_attachments, 1);
                    UI.SetEnabled(this.slider_enemy_intensity_attachments, 1);

                    UI.SetEnabled(this.colorpicker_enemy_history, 0);
                    UI.SetEnabled(this.slider_enemy_intensity_history, 0);
                }
                else if(UI.GetValue(this.dropdown_enemy_part) == 3)
                {
                    UI.SetEnabled(this.colorpicker_enemy_visible, 0);
                    UI.SetEnabled(this.slider_enemy_intensity_visible, 0);

                    UI.SetEnabled(this.colorpicker_enemy_hidden, 0);
                    UI.SetEnabled(this.slider_enemy_intensity_hidden, 0);

                    UI.SetEnabled(this.colorpicker_enemy_attachments, 0);
                    UI.SetEnabled(this.slider_enemy_intensity_attachments, 0);

                    UI.SetEnabled(this.colorpicker_enemy_history, 1);
                    UI.SetEnabled(this.slider_enemy_intensity_history, 1);
                }

            }
        }
        else
        {
            UI.SetEnabled(this.dropdown_local_part, 0);
            UI.SetEnabled(this.dropdown_enemy_part, 0);

            //-----------------------------------------------------------

            UI.SetEnabled(this.colorpicker_self_visible, 0);
            UI.SetEnabled(this.slider_self_intensity_visible, 0);
                    
            UI.SetEnabled(this.colorpicker_self_attachments, 0);
            UI.SetEnabled(this.slider_self_intensity_attachments, 0);

            UI.SetEnabled(this.colorpicker_self_desync, 0);
            UI.SetEnabled(this.slider_self_intensity_desync, 0);
                    
            UI.SetEnabled(this.colorpicker_self_fakelag, 0);
            UI.SetEnabled(this.slider_self_intensity_fakelag, 0);

            UI.SetEnabled(this.colorpicker_self_arms, 0);
            UI.SetEnabled(this.slider_self_intensity_arms, 0);

            UI.SetEnabled(this.colorpicker_self_weapon, 0);
            UI.SetEnabled(this.slider_self_intensity_weapon, 0);

            //-----------------------------------------------------------

            UI.SetEnabled(this.colorpicker_enemy_visible, 0);
            UI.SetEnabled(this.slider_enemy_intensity_visible, 0);

            UI.SetEnabled(this.colorpicker_enemy_hidden, 0);
            UI.SetEnabled(this.slider_enemy_intensity_hidden, 0);

            UI.SetEnabled(this.colorpicker_enemy_attachments, 0);
            UI.SetEnabled(this.slider_enemy_intensity_attachments, 0);

            UI.SetEnabled(this.colorpicker_enemy_history, 0);
            UI.SetEnabled(this.slider_enemy_intensity_history, 0);
        }

        //------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        UI.SetEnabled(this.dropdown_clantag, UI.GetValue(this.checkbox_clantag) ? 1 : 0);

        UI.SetEnabled(this.checkbox_include_name, UI.GetValue(this.dropdown_killsay) != 0 ? 1 : 0);
    },
    init_cfgui: function () {
        //Cheat.ExecuteCommand("clear")
        /*
        for (var i = 0; i < weapon_group.length; i++)
        {
            UI.AddDropdown(rage_path, "[" + weapon_group[i] + "] Custom Targeting", custom_target, 0)
            UI.AddMultiDropdown(rage_path, "[" + weapon_group[i] + "] Head Aim Condition", head_cond)
            UI.AddMultiDropdown(rage_path, "[" + weapon_group[i] + "] Body Aim Condition", baim_safe_cond)
            UI.AddMultiDropdown(rage_path, "[" + weapon_group[i] + "] Safepoint Condition", baim_safe_cond)
            UI.AddMultiDropdown(rage_path, "[" + weapon_group[i] + "] Safepoint Hitgroup", safe_hitgroup)
        }
        */
        for (var a = 0; a < weplist.length; a++) {
            UI.AddCheckbox(cfg_path, "[" + weplist[a] + "] Ignore Target Hitchance"),
            UI.AddSliderInt(cfg_path, "[" + weplist[a] + "] Target Hitchance", 0, 100),

            UI.AddCheckbox(cfg_path, "[" + weplist[a] + "] Defensive DT"),
            UI.AddMultiDropdown(cfg_path, "[" + weplist[a] + "] Defensive Condition", ["Standing", "Crouch", "Slowwalk"]),

            UI.AddMultiDropdown(cfg_path, "[" + weplist[a] + "] Noscope modifiers", ["Distance", "Hitchance"])
            UI.AddSliderInt(cfg_path, "[" + weplist[a] + "] Noscope distance", 0, 100),
            UI.AddSliderInt(cfg_path, "[" + weplist[a] + "] Noscope hitchance", 0, 100),

            UI.AddCheckbox(cfg_path, "[" + weplist[a] + "] Adaptive Hitchance"),
            UI.AddSliderInt(cfg_path, "[" + weplist[a] + "] Min Hitchance", 0, 100),
            UI.AddSliderInt(cfg_path, "[" + weplist[a] + "] Max Hitchance", 0, 100),

            UI.AddCheckbox(cfg_path, "[" + weplist[a] + "] Override Hitchance"),
            UI.AddSliderInt(cfg_path, "[" + weplist[a] + "] Hitchance", 0, 100),

            UI.AddCheckbox(cfg_path, "[" + weplist[a] + "] In air Hitchance"),
            UI.AddSliderInt(cfg_path, "[" + weplist[a] + "] Air Hitchance", 0, 100),

            UI.AddCheckbox(cfg_path, "[" + weplist[a] + "] Adaptive auto stop"),
            UI.AddMultiDropdown(cfg_path, "[" + weplist[a] + "] Auto stop modifiers - Standing", autostop_modifier)
            UI.AddMultiDropdown(cfg_path, "[" + weplist[a] + "] Auto stop modifiers - Moving", autostop_modifier)

            UI.AddMultiDropdown(cfg_path, "[" + weplist[a] + "] Safepoint Hitgroup", safe_hitgroup)
        }
    },
    advancecfg_control: function () {
        if (UI.GetValue(UI_List.checkbox_syncmenu)) {
            for (weapon in wep2index) {
                UI.SetValue(UI_List.dropdown_weaponconfig, 0);

                if (weapon == ent_Local.weapon_name) {
                    UI.SetValue(UI_List.dropdown_weaponconfig, wep2index[weapon]);
                    break;
                }
            }
        }
        /*
        var config_choice = UI.GetValue(UI_List.dropdown_weaponconfig);

        for (var i = 0; i < weapon_group.length; i++)
        {
            if(UI.GetValue(UI_List.checkbox_advancecfg))
            {
                if (config_choice == i)
                {
                    UI.SetEnabled(["Rage", "Rage Disaster", "Rage Disaster", "[" + weapon_group[i] + "] Custom Targeting"], 1);
                    UI.SetEnabled(["Rage", "Rage Disaster", "Rage Disaster", "[" + weapon_group[i] + "] Head Aim Condition"], 1);
                    UI.SetEnabled(["Rage", "Rage Disaster", "Rage Disaster", "[" + weapon_group[i] + "] Body Aim Condition"], 1);
                    UI.SetEnabled(["Rage", "Rage Disaster", "Rage Disaster", "[" + weapon_group[i] + "] Safepoint Condition"], 1);
                    UI.SetEnabled(["Rage", "Rage Disaster", "Rage Disaster", "[" + weapon_group[i] + "] Safepoint Hitgroup"], 1);
                }
                else
                {
                    UI.SetEnabled(["Rage", "Rage Disaster", "Rage Disaster", "[" + weapon_group[i] + "] Custom Targeting"], 0);
                    UI.SetEnabled(["Rage", "Rage Disaster", "Rage Disaster", "[" + weapon_group[i] + "] Head Aim Condition"], 0);
                    UI.SetEnabled(["Rage", "Rage Disaster", "Rage Disaster", "[" + weapon_group[i] + "] Body Aim Condition"], 0);
                    UI.SetEnabled(["Rage", "Rage Disaster", "Rage Disaster", "[" + weapon_group[i] + "] Safepoint Condition"], 0);
                    UI.SetEnabled(["Rage", "Rage Disaster", "Rage Disaster", "[" + weapon_group[i] + "] Safepoint Hitgroup"], 0);
                }
            }
            else
            {
                UI.SetEnabled(["Rage", "Rage Disaster", "Rage Disaster", "[" + weapon_group[i] + "] Custom Targeting"], 0);
                UI.SetEnabled(["Rage", "Rage Disaster", "Rage Disaster", "[" + weapon_group[i] + "] Head Aim Condition"], 0);
                UI.SetEnabled(["Rage", "Rage Disaster", "Rage Disaster", "[" + weapon_group[i] + "] Body Aim Condition"], 0);
                UI.SetEnabled(["Rage", "Rage Disaster", "Rage Disaster", "[" + weapon_group[i] + "] Safepoint Condition"], 0);
                UI.SetEnabled(["Rage", "Rage Disaster", "Rage Disaster", "[" + weapon_group[i] + "] Safepoint Hitgroup"], 0);
            }
        }
        */

        //Cheat.PrintChat(wep2index[ent_Local.weapon_name].toString());
        var wpn_id = 0;

        weapon_config = UI.GetValue(UI_List.dropdown_weaponconfig)

        for (var i = 0; i < weplist.length; i++) {
            if (UI.GetValue(UI_List.checkbox_advancecfg)) {
                if (i == weapon_config) {
                    UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Ignore Target Hitchance"], 1);
                    if(UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Ignore Target Hitchance"]))
                    {
                        UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Target Hitchance"], 1);
                    }
                    else
                    {
                        UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Target Hitchance"], 0);
                    }

                    UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Defensive DT"], 1);
                    if (UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Defensive DT"])) {
                        UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Defensive Condition"], 1);
                    } else {
                        UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Defensive Condition"], 0);
                    }

                    var noscope_opt = UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Noscope modifiers"]);

                    UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Noscope modifiers"], 1);
                    if (noscope_opt & 1 << 0) // distance
                    {
                        UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Noscope distance"], 1);
                    } else {
                        UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Noscope distance"], 0);
                    }
                    if (noscope_opt & 1 << 1) // hitchance
                    {
                        UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Noscope hitchance"], 1);
                    } else {
                        UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Noscope hitchance"], 0);
                    }

                    UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Adaptive Hitchance"], 1);
                    if (UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Adaptive Hitchance"])) {
                        UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Min Hitchance"], 1);
                        UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Max Hitchance"], 1);
                    } else {
                        UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Min Hitchance"], 0);
                        UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Max Hitchance"], 0);
                    }

                    UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Override Hitchance"], 1);
                    if (UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Override Hitchance"])) {
                        UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Hitchance"], 1);
                    } else {
                        UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Hitchance"], 0);
                    }

                    UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] In air Hitchance"], 1);
                    if (UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] In air Hitchance"])) {
                        UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Air Hitchance"], 1);
                    } else {
                        UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Air Hitchance"], 0);
                    }

                    UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Adaptive auto stop"], 1);
                    if (UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Adaptive auto stop"])) {
                        UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Auto stop modifiers - Standing"], 1);
                        UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Auto stop modifiers - Moving"], 1);
                    } else {
                        UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Auto stop modifiers - Standing"], 0);
                        UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Auto stop modifiers - Moving"], 0);
                    }

                    UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Safepoint Hitgroup"], 1);
                } else {
                    UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Ignore Target Hitchance"], 0);
                    UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Target Hitchance"], 0);
                    UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Defensive DT"], 0);
                    UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Defensive Condition"], 0);
                    UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Noscope modifiers"], 0);
                    UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Noscope distance"], 0);
                    UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Noscope hitchance"], 0);
                    UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Adaptive Hitchance"], 0);
                    UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Min Hitchance"], 0);
                    UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Max Hitchance"], 0);
                    UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Override Hitchance"], 0);
                    UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] In air Hitchance"], 0);
                    UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Air Hitchance"], 0);
                    UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Hitchance"], 0);
                    UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Adaptive auto stop"], 0);
                    UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Auto stop modifiers - Standing"], 0);
                    UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Auto stop modifiers - Moving"], 0);
                    UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Safepoint Hitgroup"], 0);
                }
            } else {
                UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Ignore Target Hitchance"], 0);
                UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Target Hitchance"], 0);
                UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Defensive DT"], 0);
                UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Defensive Condition"], 0);
                UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Noscope modifiers"], 0);
                UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Noscope distance"], 0);
                UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Noscope hitchance"], 0);
                UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Adaptive Hitchance"], 0);
                UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Min Hitchance"], 0);
                UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Max Hitchance"], 0);
                UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Override Hitchance"], 0);
                UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] In air Hitchance"], 0);
                UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Air Hitchance"], 0);
                UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Hitchance"], 0);
                UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Adaptive auto stop"], 0);
                UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Auto stop modifiers - Standing"], 0);
                UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Auto stop modifiers - Moving"], 0);
                UI.SetEnabled(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[i] + "] Safepoint Hitgroup"], 0);
            }
        }

        //Cheat.Print(UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "Weapon Config"]).toString());
    },
}

UI_List.init_cfgui();

// Hotkeys
const Keys = {
    override_resolver: false,
    force_baim: false,
    force_safepoint: false,
    override_dmg: false,
    override_hitbox: false,
    override_hc: false,
    doubletap: false,
    hideshot: false,

    left_direction: false,
    back_direction: false,
    right_direction: false,
    mouse_direction: false,
    aa_invert: false,
    jitter: false,
    slowwalk: false,
    fakeduck: false,
    lowdelta: false,
    legitaa: false,
    idealtick: false,
    autodir: false,

    edge_jump: false,
    auto_peek: false,
    thirdperson: false,
    zoom: false,
    freecam: false,

    Update: function () {
        this.override_resolver = UI.GetValue(["Rage", "General", "General", "Key assignment", "Resolver override"]);
        this.force_baim = UI.GetValue(["Rage", "General", "General", "Key assignment", "Force body aim"]);
        this.force_safepoint = UI.GetValue(["Rage", "General", "General", "Key assignment", "Force safe point"]);
        this.override_dmg = UI.GetValue(["Rage", "General", "General", "Key assignment", "Damage override"]);
        this.override_hitbox = UI.GetValue(["Rage", "General", "General", "Key assignment", "Hitbox override"]);
        this.override_hc = UI.GetValue(["Rage", "General", "General", "Key assignment", "Hitchance override"]);
        this.doubletap = UI.GetValue(["Rage", "Exploits", "Keys", "Key assignment", "Double tap"]);
        this.hideshot = UI.GetValue(["Rage", "Exploits", "Keys", "Key assignment", "Hide shots"]);

        this.left_direction = UI.GetValue(["Rage", "Anti Aim", "General", "Key assignment", "Left direction"]);
        this.back_direction = UI.GetValue(["Rage", "Anti Aim", "General", "Key assignment", "Back direction"]);
        this.right_direction = UI.GetValue(["Rage", "Anti Aim", "General", "Key assignment", "Right direction"]);
        this.Mouse_direction = UI.GetValue(["Rage", "Anti Aim", "General", "Key assignment", "Mouse direction"]);
        this.aa_invert = UI.GetValue(["Rage", "Anti Aim", "General", "Key assignment", "AA direction inverter"]);
        this.jitter = UI.GetValue(["Rage", "Anti Aim", "General", "Key assignment", "Jitter"]);
        this.slowwalk = UI.GetValue(["Rage", "Anti Aim", "General", "Key assignment", "Slow walk"]);
        this.fakeduck = UI.GetValue(["Rage", "Anti Aim", "General", "Key assignment", "Fake duck"]);
        this.lowdelta = UI.GetValue(["Rage", "Anti Aim", "General", "Key assignment", "Low Delta"]);
        this.legitaa = UI.GetValue(["Rage", "Anti Aim", "General", "Key assignment", "Legit AA"]);
        this.idealtick = UI.GetValue(["Rage", "Anti Aim", "General", "Key assignment", "Ideal Tick"]);
        this.autodir = UI.GetValue(["Rage", "Anti Aim", "General", "Key assignment", "Auto Direction"]);

        this.edge_jump = UI.GetValue(["Misc.", "Keys", "Keys", "Key assignment", "Edge jump"]);
        this.auto_peek = UI.GetValue(["Misc.", "Keys", "Keys", "Key assignment", "Auto peek"]);
        this.thirdperson = UI.GetValue(["Misc.", "Keys", "Keys", "Key assignment", "Thirdperson"]);
        this.zoom = UI.GetValue(["Misc.", "Keys", "Keys", "Key assignment", "Zoom"]);
        this.freecam = UI.GetValue(["Misc.", "Keys", "Keys", "Key assignment", "Freecam"]);
    }
}

// Functions
const Rage = {
    overrideDT: function () {
        if (UI.GetValue(UI_List.checkbox_overrideDT)) {
            /*
            Exploit.OverrideShift(16);
            Exploit.OverrideTolerance(0);
            */

            var delay = UI.GetValue(UI_List.checkbox_delay) ? 1 : 0;

            //Cheat.PrintChat(delay.toString());

            if(UI.GetValue(UI_List.dropdown_dtmode) == 0 )
            {
                Convar.SetInt("sv_maxusrcmdprocessticks", 20);
                Exploit.OverrideShift(20);
                Exploit.OverrideMaxProcessTicks(20)
                Exploit.OverrideTolerance(delay);
            }
            else if(UI.GetValue(UI_List.dropdown_dtmode) == 1 )
            {
                Convar.SetInt("sv_maxusrcmdprocessticks", 16);
                Exploit.OverrideShift(16);
                Exploit.OverrideMaxProcessTicks(16)
                Exploit.OverrideTolerance(delay);
            }
            else if(UI.GetValue(UI_List.dropdown_dtmode) == 2 )
            {
                Convar.SetInt("sv_maxusrcmdprocessticks", 16);
                Exploit.OverrideShift(14);
                Exploit.OverrideMaxProcessTicks(16)
                Exploit.OverrideTolerance(delay);
            }
        } else {
            Exploit.OverrideShift(14);  
            Exploit.OverrideTolerance(1);
        }
    },
    fast_recharge: function () {
        
        if (UI.GetValue(UI_List.checkbox_fastrecharge)) {
            if (canShiftShot(UI.GetValue(UI_List.slider_rechargetimer)) && Exploit.GetCharge() != 1) {
                Exploit.DisableRecharge();
                Exploit.Recharge();
            }
        } else {
            Exploit.EnableRecharge();
        }
    },
    target_hitchance : function()
    {
        weapon_config = UI.GetValue(UI_List.dropdown_weaponconfig)

        if(!UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[weapon_config] + "] Ignore Target Hitchance"])) return;

        if(Ragebot.GetTargetHitchance() < UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[weapon_config] + "] Target Hitchance"]) )
        {
            if(!ent_Local.is_scoped && Keys.idealtick) return;
            
                /*
                Cheat.PrintChat("Ignored!");
                Cheat.PrintChat(Ragebot.GetTargetHitchance().toString() + "\n");
                */
            Ragebot.IgnoreTarget(Ragebot.GetTarget());
        }
    },
    force_cond: function () {
        /*
        if (!UI.GetValue(UI_List.checkbox_advancecfg)) return;

        var enemies_list = Entity.GetEnemies();

        //Cheat.Print(weapon_group[ent_Local.weapon_group].toString() + "\n");
        var head_opt = UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weapon_group[ent_Local.weapon_group] + "] Head Aim Condition"]);
        var baim_opt = UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weapon_group[ent_Local.weapon_group] + "] Body Aim Condition"]);
        var safe_opt = UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weapon_group[ent_Local.weapon_group] + "] Safepoint Condition"]);
        var safe_hitgroup = UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weapon_group[ent_Local.weapon_group] + "] Safepoint Hitgroup"]);

        for (var i = 0; i < enemies_list.length ; i++)
        {
            if (!Entity.IsValid(enemies_list[i])) continue;
            if (!Entity.IsAlive(enemies_list[i])) continue;
            if (Entity.IsDormant(enemies_list[i])) continue;

            if( (head_opt & 1 << 0 && is_standing(enemies_list[i])) || (head_opt & 1 << 2 && is_crouching(enemies_list[i])) || (head_opt & 1 << 3 && is_walking(enemies_list[i])) || (head_opt & 1 << 4 && is_running(enemies_list[i])) || (head_opt & 1 << 5 && is_inair(enemies_list[i])) )
            {
                //Cheat.Print("TEST\n");
                force_head(enemies_list[i]);
            }
            else if( (baim_opt & 1 << 0 && is_standing(enemies_list[i])) || (baim_opt & 1 << 2 && is_crouching(enemies_list[i])) || (baim_opt & 1 << 3 && is_walking(enemies_list[i])) || (baim_opt & 1 << 4 && is_running(enemies_list[i])) || (baim_opt & 1 << 5 && is_inair(enemies_list[i])) )
            {
                if(ent_Target.target == enemies_list[i])
                {
                    force_body()
                }
                else
                {
                    disable_body();
                }
            }
            else if( (safe_opt & 1 << 0 && is_standing(enemies_list[i])) || (safe_opt & 1 << 2 && is_crouching(enemies_list[i])) || (safe_opt & 1 << 3 && is_walking(enemies_list[i])) || (safe_opt & 1 << 4 && is_running(enemies_list[i])) || (safe_opt & 1 << 5 && is_inair(enemies_list[i])) )
            {
                if(ent_Target.target == enemies_list[i])
                {
                    if (safe_hitgroup & 1 << 0)
                    {
                        Ragebot.ForceHitboxSafety(0)
                    }
                    if (safe_hitgroup & 1 << 1)
                    {
                        Ragebot.ForceHitboxSafety(4)
                        Ragebot.ForceHitboxSafety(5)
                        Ragebot.ForceHitboxSafety(6)
                    }
                    if (safe_hitgroup & 1 << 2)
                    {
                        Ragebot.ForceHitboxSafety(2)
                        Ragebot.ForceHitboxSafety(3)
                    }
                    if (safe_hitgroup & 1 << 3)
                    {
                        Ragebot.ForceHitboxSafety(13)
                        Ragebot.ForceHitboxSafety(14)
                    }
                    if (safe_hitgroup & 1 << 4)
                    {
                        Ragebot.ForceHitboxSafety(7)
                        Ragebot.ForceHitboxSafety(8)
                        Ragebot.ForceHitboxSafety(9)
                        Ragebot.ForceHitboxSafety(10)
                    }
                    if (safe_hitgroup & 1 << 5)
                    {
                        //Cheat.Print("Feet\n");
                        Ragebot.ForceHitboxSafety(11)
                        Ragebot.ForceHitboxSafety(12)
                    }
                }
            }
            else
            {
                disable_body();
            }
        }
        */
    },
    defensiveDT: function () {
        if (!UI.GetValue(UI_List.checkbox_advancecfg)) return;

        weapon_config = UI.GetValue(UI_List.dropdown_weaponconfig)

        var bhop = Input.IsKeyPressed(0x20);

        if (bhop) return;

        if (UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[weapon_config] + "] Defensive DT"])) {
            var value = UI.GetValue(["Rage", "Exploits", "General", "Options"]);
            var choice = UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[weapon_config] + "] Defensive Condition"]);

            if (is_moving(ent_Local.id)) {
                if (is_crouching(ent_Local.id) && (choice & 1 << 1)) {
                    value = setDropdownValue(value, 0, false);
                } else if ((choice & 1 << 2) && Keys.slowwalk) {
                    value = setDropdownValue(value, 0, false);
                } else {
                    value = setDropdownValue(value, 0, true);
                }
            } else {
                if ((choice & 1 << 0) && is_standing(ent_Local.id)) {
                    value = setDropdownValue(value, 0, false);
                } else {
                    value = setDropdownValue(value, 0, true);
                }
            }
            /*
            if((choice & 1 << 0) && is_standing(ent_Local.id) && !is_crouching(ent_Local.id))
            {
                value = setDropdownValue(value, 0, false);
            }
            if((choice & 1 << 1) && is_crouching(ent_Local.id))
            {
                value = setDropdownValue(value, 0, false);
            }
            if((choice & 1 << 2) && Keys.slowwalk)
            {
                value = setDropdownValue(value, 0, false);
            }
            if (!is_standing(ent_Local.id))
            {
                value = setDropdownValue(value, 0, true);
            }
            */

            UI.SetValue(["Rage", "Exploits", "General", "Options"], value)
        }
    },
    zeus_fl: function () {
        if (UI.GetValue(UI_List.checkbox_zeusfl)) {
            if (ent_Local.weapon_name == "zeus x27") {
                UI.SetValue(["Rage", "Exploits", "General", "Double tap"], 0);
                UI.SetValue(["Rage", "Exploits", "General", "Hide shots"], 0);
            } else {
                UI.SetValue(["Rage", "Exploits", "General", "Double tap"], 1);
                UI.SetValue(["Rage", "Exploits", "General", "Hide shots"], 1);
            }
        }
    },
    adaptiveAutostop: function () {
        weapon_config = UI.GetValue(UI_List.dropdown_weaponconfig)

        if (UI.GetValue(UI_List.checkbox_advancecfg) && UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[weapon_config] + "] Adaptive auto stop"])) {
            var stand_autostop = UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[weapon_config] + "] Auto stop modifiers - Standing"]);
            var move_autostop = UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[weapon_config] + "] Auto stop modifiers - Moving"]);

            UI.SetValue(["Rage", "Accuracy", weplist[weapon_config], "Auto stop modifiers"], is_standing(ent_Local.id) ? stand_autostop : move_autostop);
        }
    },
    overrideHC: function () {
        if (!UI.GetValue(UI_List.checkbox_advancecfg)) return;

        weapon_config = UI.GetValue(UI_List.dropdown_weaponconfig)

        if (UI.GetValue(UI_List.checkbox_advancecfg) && UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[weapon_config] + "] Override Hitchance"]) && Keys.override_hc) {
            var hc = UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[weapon_config] + "] Hitchance"]);

            enemies = Entity.GetEnemies();

            for (i in enemies) {
                Ragebot.ForceTargetHitchance(enemies[i], hc);
            }
        }
    },
    force_hitbox_safety: function () {
        if (!UI.GetValue(UI_List.checkbox_advancecfg)) return;

        weapon_config = UI.GetValue(UI_List.dropdown_weaponconfig)

        var safe_hitgroup = UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[weapon_config] + "] Safepoint Hitgroup"]);

        if (safe_hitgroup & 1 << 0) {
            Ragebot.ForceHitboxSafety(0)
        }
        if (safe_hitgroup & 1 << 1) {
            Ragebot.ForceHitboxSafety(4)
            Ragebot.ForceHitboxSafety(5)
            Ragebot.ForceHitboxSafety(6)
        }
        if (safe_hitgroup & 1 << 2) {
            Ragebot.ForceHitboxSafety(2)
            Ragebot.ForceHitboxSafety(3)
        }
        if (safe_hitgroup & 1 << 3) {
            Ragebot.ForceHitboxSafety(13)
            Ragebot.ForceHitboxSafety(14)
        }
        if (safe_hitgroup & 1 << 4) {
            Ragebot.ForceHitboxSafety(7)
            Ragebot.ForceHitboxSafety(8)
            Ragebot.ForceHitboxSafety(9)
            Ragebot.ForceHitboxSafety(10)
        }
        if (safe_hitgroup & 1 << 5) {
            //Cheat.Print("Feet\n");
            Ragebot.ForceHitboxSafety(11)
            Ragebot.ForceHitboxSafety(12)
        }
    },
    noscope_modifier_distance: function () {
        if (!UI.GetValue(UI_List.checkbox_advancecfg)) return;

        weapon_config = UI.GetValue(UI_List.dropdown_weaponconfig)

        noscope_opt = UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[weapon_config] + "] Noscope modifiers"]);
        var noscope_distance = UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[weapon_config] + "] Noscope distance"]);

        if (noscope_opt & 1 << 0) {
            if (!Entity.IsAlive(ent_Local.id)) {
                UI.SetValue(["Rage", "Accuracy", "SCAR20", "Auto scope"], 1);
                UI.SetValue(["Rage", "Accuracy", "G3SG1", "Auto scope"], 1);
                return;
            }

            if (ent_Target.distance < noscope_distance) {
                UI.SetValue(["Rage", "Accuracy", "SCAR20", "Auto scope"], 0);
                UI.SetValue(["Rage", "Accuracy", "G3SG1", "Auto scope"], 0);
            } else {
                UI.SetValue(["Rage", "Accuracy", "SCAR20", "Auto scope"], 1);
                UI.SetValue(["Rage", "Accuracy", "G3SG1", "Auto scope"], 1);
            }
        }
    },
    noscope_modifier_hitchance: function () {
        if (!UI.GetValue(UI_List.checkbox_advancecfg)) return;

        weapon_config = UI.GetValue(UI_List.dropdown_weaponconfig)

        noscope_opt = UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[weapon_config] + "] Noscope modifiers"]);

        var noscope_hitchance = UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[weapon_config] + "] Noscope hitchance"]);

        if (noscope_opt & 1 << 1) {
            if (ent_Local.weapon_name == 'scar 20' || ent_Local.weapon_name == 'g3sg1') {
                if (!ent_Local.is_scoped) Ragebot.ForceTargetHitchance(ent_Target.target, noscope_hitchance);
            }
        }
    },
    adaptive_hc : function()
    {
        weapon_config = UI.GetValue(UI_List.dropdown_weaponconfig)

        if(!UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[weapon_config] + "] Adaptive Hitchance"])) return;

        min_hc = UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[weapon_config] + "] Min Hitchance"]);
        max_hc = UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[weapon_config] + "] Max Hitchance"]);

        var enemies = Entity.GetEnemies();

        for (i in enemies)
        {
            distance = get_metric_distance(Entity.GetRenderOrigin(ent_Local.id), Entity.GetRenderOrigin(enemies[i]));

            result = ((distance * 100) / max_hc) + min_hc;

            if(result < min_hc)
            {
                Ragebot.ForceTargetHitchance(enemies[i], min_hc)
            }
            else if(result > max_hc)
            {
                Ragebot.ForceTargetHitchance(enemies[i], max_hc)
            }
            else if(result > min_hc && result < max_hc)
            {
                Ragebot.ForceTargetHitchance(enemies[i], result)
            }
        }
    },
    air_hc : function()
    {
        weapon_config = UI.GetValue(UI_List.dropdown_weaponconfig)

        if(!UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[weapon_config] + "] In air Hitchance"])) return;

        if(is_inair(ent_Local.id))
        {
            enemies = Entity.GetEnemies();

            for (i in enemies) {
                Ragebot.ForceTargetHitchance(enemies[i], UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[weapon_config] + "] Air Hitchance"]));
            }
        }
    },
}

var gtime = 0;
var counter = 0;

const AA = {
    presetAA: false,
    lowdelta: false,
    legitAA: false,

    current_mode: 0,
    inverted: 0,
    should_invert: 0,

    Update: function () {
        this.current_mode = UI.GetValue(UI_List.dropdown_bodyfreestanding);
        this.inverted = UI.GetValue(ref_inverter);
    },
    preset_aa: function () {
        if (UI.GetValue(UI_List.dropdown_presetAA) == 0) {
            if (!this.legitAA && !this.lowdelta) {
                AntiAim.SetOverride(0);
            }

            this.presetAA = false;

        } else if (UI.GetValue(UI_List.dropdown_presetAA) == 1) {
            // Check if we should update our inverter.
            if (!Keys.aa_invert) {
                AntiAim.SetOverride(1);
                AntiAim.SetRealOffset(-(Math.floor(Math.random() * (30 - 0)) + 0));
                AntiAim.SetFakeOffset(Math.floor(Math.random() * (20 - 0)) + 0);
                AntiAim.SetLBYOffset(-60 + Math.sin(Globals.Tickcount() * Globals.TickInterval() * 2) * 90);
                //Cheat.PrintChat("1");
            } else {
                AntiAim.SetOverride(1);
                AntiAim.SetRealOffset(Math.floor(Math.random() * (20 - 0)) + 0);
                AntiAim.SetFakeOffset(-(Math.floor(Math.random() * (30 - 0)) + 0));
                AntiAim.SetLBYOffset(-60 + Math.sin(Globals.Tickcount() * Globals.TickInterval() * 2) * 90);
                //Cheat.PrintChat("2");
            }
            this.presetAA = true;
        } else if (UI.GetValue(UI_List.dropdown_presetAA) == 2) {
            // Check if we should update our inverter.
            if (!Keys.aa_invert) {
                AntiAim.SetOverride(1);
                AntiAim.SetRealOffset(-34);
                AntiAim.SetFakeOffset(5);
                AntiAim.SetLBYOffset(-60 + Math.sin(Globals.Tickcount() * Globals.TickInterval() * 2) * 90);
                //Cheat.PrintChat("1");
            } else {
                AntiAim.SetOverride(1);
                AntiAim.SetRealOffset(34);
                AntiAim.SetFakeOffset(-5);
                AntiAim.SetLBYOffset(-60 + Math.sin(Globals.Tickcount() * Globals.TickInterval() * 2) * 90);
                //Cheat.PrintChat("2");
            }
            this.presetAA = true;
        } else if (UI.GetValue(UI_List.dropdown_presetAA) == 3) {
            // Check if we should update our inverter.
            if (Globals.Tickcount() % 3 == 1) {
                AntiAim.SetOverride(1);
                AntiAim.SetRealOffset(-25);
                AntiAim.SetFakeOffset(3);
                AntiAim.SetLBYOffset(-60 + Math.sin(Globals.Tickcount() * Globals.TickInterval() * 2) * 90);
                //Cheat.PrintChat("1");
            } else {
                AntiAim.SetOverride(1);
                AntiAim.SetRealOffset(25);
                AntiAim.SetFakeOffset(-3);
                AntiAim.SetLBYOffset(-60 + Math.sin(Globals.Tickcount() * Globals.TickInterval() * 2) * 90);
                //Cheat.PrintChat("2");
            }
            this.presetAA = true;
        } else if (UI.GetValue(UI_List.dropdown_presetAA) == 4) {
            AntiAim.SetOverride(1);
            AntiAim.SetRealOffset(0);
            if (Globals.Tickcount() % 3 == 1) {
                AntiAim.SetFakeOffset(-20);
            } else {
                AntiAim.SetFakeOffset(20);
            }
            AntiAim.SetLBYOffset(-60 + Math.sin(Globals.Tickcount() * Globals.TickInterval() * 2) * 90);
            //Cheat.PrintChat("1");
            this.presetAA = true;
        } else if (UI.GetValue(UI_List.dropdown_presetAA) == 5) {

            AntiAim.SetOverride(1);

            if (Globals.Tickcount() % 3 == 1) {
                AntiAim.SetRealOffset(-(Math.floor(Math.random() * (31 - 26)) + 26));
            } else {
                AntiAim.SetRealOffset(-(Math.floor(Math.random() * (36 - 31)) + 31));
            }

            /*
            AntiAim.SetOverride(1);
            AntiAim.SetRealOffset(Math.floor(Math.random() * (1 - (-20))) + (-20));
            AntiAim.SetFakeOffset(-10);
            AntiAim.SetLBYOffset(23);
            */
            /*
            AntiAim.SetOverride(1);
            AntiAim.SetRealOffset(-(Math.floor(Math.random() * (31 - 26)) + 26));
            AntiAim.SetRealOffset(-(Math.floor(Math.random() * (36 - 31)) + 31));
            */
            AntiAim.SetFakeOffset(10);
            AntiAim.SetLBYOffset(39);
            //Cheat.PrintChat("1");
            this.presetAA = true;
        }
        else if (UI.GetValue(UI_List.dropdown_presetAA) == 6) {
            // Check if we should update our inverter.
            if (!Keys.aa_invert) {
                var idealfake = (-(Math.floor(Math.random() * (11 - 1)) + 1))
                var idealreal = 60 + idealfake - 36
                var ideallby = -60 + idealreal + 36

                AntiAim.SetOverride(1);
                AntiAim.SetRealOffset(idealreal);
                AntiAim.SetFakeOffset(idealfake);
                AntiAim.SetLBYOffset(ideallby);
                //Cheat.PrintChat("1");
            } else {
                var idealfake = (Math.floor(Math.random() * (11 - 1)) + 1)
                var idealreal = -60 + idealfake + 36
                var ideallby = 60 + idealreal - 36

                AntiAim.SetOverride(1);
                AntiAim.SetRealOffset(idealreal);
                AntiAim.SetFakeOffset(idealfake);
                AntiAim.SetLBYOffset(ideallby);
                //Cheat.PrintChat("2");
            }
            this.presetAA = true;
        }
        else if (UI.GetValue(UI_List.dropdown_presetAA) == 7) {

            if (!Keys.aa_invert) {
                AntiAim.SetOverride(1);
                AntiAim.SetRealOffset(-(Math.floor(Math.random() * (40 - 0)) + 0));
                if (Globals.Tickcount() % 3 == 1)
                {
                    AntiAim.SetFakeOffset(10);
                }
                else
                {
                    AntiAim.SetFakeOffset(-10);
                }
                AntiAim.SetLBYOffset(-60 + Math.sin(Globals.Tickcount() * Globals.TickInterval() * 2) * 90);
                //Cheat.PrintChat("1");
            } else {
                AntiAim.SetOverride(1);
                AntiAim.SetRealOffset(Math.floor(Math.random() * (40 - 0)) + 0);
                if (Globals.Tickcount() % 3 == 1)
                {
                    AntiAim.SetFakeOffset(-10);
                }
                else
                {
                    AntiAim.SetFakeOffset(10);
                }
                AntiAim.SetLBYOffset(-60 + Math.sin(Globals.Tickcount() * Globals.TickInterval() * 2) * 90);
                //Cheat.PrintChat("2");
            }
            //Cheat.PrintChat("1");
            this.presetAA = true;
        }
        else if (UI.GetValue(UI_List.dropdown_presetAA) == 8 && UI.GetValue(UI_List.dropdown_custommode) == 0)
        {
            if (!Keys.aa_invert)
            {
                AntiAim.SetOverride(1);
                AntiAim.SetRealOffset(UI.GetValue(UI_List.slider_real));
                AntiAim.SetFakeOffset(UI.GetValue(UI_List.slider_fake));
                AntiAim.SetLBYOffset(UI.GetValue(UI_List.slider_lby));
            }
            else
            {
                AntiAim.SetOverride(1);
                AntiAim.SetRealOffset(-(UI.GetValue(UI_List.slider_real)));
                AntiAim.SetFakeOffset(-(UI.GetValue(UI_List.slider_fake)));
                AntiAim.SetLBYOffset(-(UI.GetValue(UI_List.slider_lby)));
            }
            this.presetAA = true;
        }
        else if (UI.GetValue(UI_List.dropdown_presetAA) == 8 && UI.GetValue(UI_List.dropdown_custommode) == 1)
        {
            var delay = UI.GetValue(UI_List.slider_delay)

            AntiAim.SetOverride(1);

            if(counter % 2 == 0)
            {
                AntiAim.SetRealOffset(UI.GetValue(UI_List.slider_real));
                AntiAim.SetFakeOffset(UI.GetValue(UI_List.slider_fake));
                AntiAim.SetLBYOffset(UI.GetValue(UI_List.slider_lby));
            }
            else
            {
                AntiAim.SetRealOffset(UI.GetValue(UI_List.slider_real2));
                AntiAim.SetFakeOffset(UI.GetValue(UI_List.slider_fake2));
                AntiAim.SetLBYOffset(UI.GetValue(UI_List.slider_lby2));
            }
            if(Globals.Realtime() > gtime + delay)
            {
                //Cheat.PrintChat("1 || 2");
                gtime = Globals.Realtime();
                counter++;
            }

            if(counter == 100)
            {
                counter = 0;
            }
            this.presetAA = true;
        }
        else if (UI.GetValue(UI_List.dropdown_presetAA) == 8 && UI.GetValue(UI_List.dropdown_custommode) == 2)
        {
            real1 = UI.GetValue(UI_List.slider_real)
            real2 = UI.GetValue(UI_List.slider_real2)
            fake1 = UI.GetValue(UI_List.slider_fake)
            fake2 = UI.GetValue(UI_List.slider_fake2)
            lby1 = UI.GetValue(UI_List.slider_lby)
            lby2 = UI.GetValue(UI_List.slider_lby2)

            AntiAim.SetOverride(1);
            AntiAim.SetRealOffset(Math.floor(Math.random() * (real2 - real1)) + real1);
            AntiAim.SetFakeOffset(Math.floor(Math.random() * (fake2 - fake1)) + fake1);
            AntiAim.SetLBYOffset(Math.floor(Math.random() * (lby2 - lby1)) + lby1);
            this.presetAA = true;
        }
    },
    should_update: function () {
        // Get current freestanding mode.
        const current_mode = UI.GetValue(UI_List.dropdown_bodyfreestanding);

        // Check if our freestanding side changed.
        if (ent_Target.freestandside === ent_Target.lastfreestandside)
            return;

        // Save this side for further checks.
        ent_Target.lastfreestandside = ent_Target.freestandside;

        // Check if the script is enabled.
        if (!current_mode)
            return;

        // Get inverted states.
        const inverted = UI.GetValue(ref_inverter);
        const desired = current_mode == 1 ? ent_Target.freestandside == 1 : ent_Target.freestandside == 2;

        if (inverted != desired) {
            UI.ToggleHotkey(ref_inverter);
        }

    },
    getFreestandingSide: function (me) {
        // Get local properties.
        const eye_position = Entity.GetEyePosition(me);
        const eye_angles = Local.GetViewAngles()[1];

        // Initialize the object where our data will be stored.
        var data = {
            damages: [0, 0],
            fractions: {
                left: 0,
                right: 0
            }
        };

        // Reset freestanding side.
        ent_Target.freestandside = 0;

        // Check if we have a valid target.
        if (ent_Target.target) {
            // Get this target's head position.
            const head_position = Entity.GetHitboxPosition(ent_Target.target, 0);

            // Initialize arrays used for calculations.
            const multiplier = [32, 32, 32];
            const angles = [-90, 90];

            // Loop through every freestanding angle.
            for (var i = 0; i < angles.length; i++) {
                // Get the current angle.
                const current = angles[i];

                // Calculate the extrapolated point.
                const direction = multiply(angle_to_vector([0, eye_angles + current, 0]), multiplier);
                const point = extrapolate(me, [
                    eye_position[0] + direction[0],
                    eye_position[1] + direction[1],
                    eye_position[2] + direction[2],
                ], 4);

                // Trace a bullet from the extrapolated point to the target's head.
                // These points are extrapolated 32 units to the right and left.
                const bullet = Trace.Bullet(me, ent_Target.target, point, head_position);

                // Check if our bullet data is valid.
                // Prevents rare case where it returns null.
                if (!bullet)
                    continue;

                // Update our damage data.
                data.damages[i] = bullet[1];
            }

            // If the left damage is lower than the right one, we
            // want to put our head there.
            if (data.damages[0] < data.damages[1]) {
                // Update freestanding side to left.
                ent_Target.freestandside = 1;
            }

            // If the left damage is greather than the right one, we
            // want to put our head to the other way.
            else if (data.damages[0] > data.damages[1]) {
                // Update freestanding side to right.
                ent_Target.freestandside = 2;
            }
        }

        // If none of those conditions are met, it means we didn't have accurate damage information
        // to freestand. So, proceed with normal trace freestanding.
        if (ent_Target.freestandside)
            return;

        // Start from your backwards angle and do a 360.
        for (var i = eye_angles - 180; i < eye_angles + 180; i += 180 / 12) {
            // Check if our current angle is equals our eye angle.
            // If so continue because the center point can't be right or left.
            if (i === eye_angles)
                continue;

            // Convert this angle into radians.
            const rotation = degree_to_radian(i);

            // Calculate the extrapolated point once again.
            const point = [
                eye_position[0] + Math.cos(rotation) * 256,
                eye_position[1] + Math.sin(rotation) * 256,
                eye_position[2]
            ];

            // Trace a line from our eye position to the extrapolated point.
            // These points are making a circle around you with a 256u radius.
            const line = Trace.Line(me, eye_position, point);

            // Check if our trace data is valid.
            // Prevents rare case where it returns null.
            if (!line)
                continue;

            // Update our trace data.
            data.fractions[i > eye_angles ? "right" : "left"] += line[1];
        }

        // If the left walls are closer than the right ones,
        // put our head to the left.
        if (data.fractions.left < data.fractions.right) {
            // Update freestanding side to left.
            ent_Target.freestandside = 1;
        }

        // If the left walls are further away than the right ones,
        // put our head to the right.
        else if (data.fractions.left > data.fractions.right) {
            // Update freestanding side to right.
            ent_Target.freestandside = 2;
        }
    },
    update_freestanding: function () {
        getBestTarget(ent_Local.id);
        AA.getFreestandingSide(ent_Local.id);
    },
    update_settings: function () {
        if (this.presetAA || this.legitAA || this.lowdelta) return;

        // Get current freestanding mode.
        const current_mode = UI.GetValue(UI_List.dropdown_bodyfreestanding);

        // Check if our freestanding side changed.
        if (ent_Target.freestandside === ent_Target.last_freestandside)
            return;

        // Save this side for further checks.
        ent_Target.last_freestandside = ent_Target.freestandside;

        // Check if the script is enabled.
        if (!current_mode)
            return;

        // Get inverted states.
        const inverted = UI.GetValue(ref_inverter);
        const desired = current_mode == 1 ? ent_Target.freestandside == 1 : ent_Target.freestandside == 2;

        //Cheat.PrintChat(inverted + " || " + desired);

        // Check if our inverter hotkey is bound. If not,
        // force bind it.
        if (!UI.GetHotkey(ref_inverter))
            UI.SetValue(ref_inverter, 100);

        // Check if our inverter hotkey is on Toggle. If not,
        // force it to Toggle.
        if (UI.GetHotkeyState(ref_inverter) != "Toggle")
            UI.SetHotkeyState(ref_inverter, "Toggle");

        // Check if we should update our inverter.
        if (inverted != desired)
            // Toggle / Untoggle the inverter.
            UI.ToggleHotkey(ref_inverter);
    },
    low_delta: function () {
        if (UI.GetValue(UI_List.checkbox_lowdelta)) {
            if (UI.GetValue(UI_List.dropdown_lowdelta) == 0) {
                if (Keys.lowdelta) {
                    AntiAim.SetOverride(1);
                    AntiAim.SetRealOffset(-(Math.floor(Math.random() * (25 - 17)) + 17));
                    AntiAim.SetFakeOffset(0);
                    AntiAim.SetLBYOffset(Math.floor(Math.random() * (23 - 21)) + 21);
                    this.lowdelta = true;
                } else {
                    if (!this.presetAA && !this.legitAA) {
                        AntiAim.SetOverride(0);
                    }
                    this.lowdelta = false
                }
            } else if (UI.GetValue(UI_List.dropdown_lowdelta) == 1) {
                if (Keys.lowdelta) {
                    if (Globals.Tickcount() % 10 == 3) {
                        AntiAim.SetOverride(1);
                        AntiAim.SetRealOffset(-21);
                        AntiAim.SetFakeOffset(0);
                        AntiAim.SetLBYOffset(Math.floor(Math.random() * (23 - 21)) + 21);
                        this.lowdelta = true;
                    } else if (Globals.Tickcount() % 10 > 6) {
                        AntiAim.SetOverride(1);
                        AntiAim.SetRealOffset(-25);
                        AntiAim.SetFakeOffset(0);
                        AntiAim.SetLBYOffset(Math.floor(Math.random() * (23 - 21)) + 21);
                        this.lowdelta = true;
                    } else {
                        AntiAim.SetOverride(1);
                        AntiAim.SetRealOffset(-17);
                        AntiAim.SetFakeOffset(0);
                        AntiAim.SetLBYOffset(Math.floor(Math.random() * (23 - 21)) + 21);
                        this.lowdelta = true;
                    }
                } else {
                    if (!this.presetAA && !this.legitAA) {
                        AntiAim.SetOverride(0);
                    }
                    this.lowdelta = false
                }
            } else if (UI.GetValue(UI_List.dropdown_lowdelta) == 2) {
                if (Keys.lowdelta) {
                    if (Globals.Tickcount() % 3 == 1) {
                        AntiAim.SetOverride(1);
                        AntiAim.SetRealOffset(-17);
                        AntiAim.SetFakeOffset(0);
                        AntiAim.SetLBYOffset(Math.floor(Math.random() * (23 - 21)) + 21);
                        this.lowdelta = true;
                    } else {
                        AntiAim.SetOverride(1);
                        AntiAim.SetRealOffset(17);
                        AntiAim.SetFakeOffset(0);
                        AntiAim.SetLBYOffset(Math.floor(Math.random() * (23 - 21)) + 21);
                        this.lowdelta = true;
                    }
                } else {
                    if (!this.presetAA && !this.legitAA) {
                        AntiAim.SetOverride(0);
                    }
                    this.lowdelta = false
                }
            } else if (UI.GetValue(UI_List.dropdown_lowdelta) == 3) {
                if (Keys.lowdelta) {
                    AntiAim.SetOverride(1);
                    AntiAim.SetRealOffset(-18);
                    AntiAim.SetFakeOffset(0);
                    AntiAim.SetLBYOffset(0);
                    this.lowdelta = true;
                } else {
                    if (!this.presetAA && !this.legitAA) {
                        AntiAim.SetOverride(0);
                    }
                    this.lowdelta = false
                }
            } else if (UI.GetValue(UI_List.dropdown_lowdelta) == 4) {
                if (Keys.lowdelta) {
                    AntiAim.SetOverride(1);
                    AntiAim.SetRealOffset(Math.floor(Math.random() * (1 - (-20))) + (-20));
                    AntiAim.SetFakeOffset(-10);
                    AntiAim.SetLBYOffset(23);
                    this.lowdelta = true;
                } else {
                    if (!this.presetAA && !this.legitAA) {
                        AntiAim.SetOverride(0);
                    }
                    this.lowdelta = false
                }
            }
        }
    },
    legit_aa: function () {
        if (Keys.legitaa) {
            AntiAim.SetOverride(1);
            AntiAim.SetRealOffset(-30);
            AntiAim.SetFakeOffset(30);
            AntiAim.SetLBYOffset(Math.floor(Math.random() * (24 - 21)) + 21);
            UI.SetValue(["Config", "Cheat", "General", "Restrictions"], 0);
            UI.SetValue(["Rage", "Anti Aim", "Directions", "Yaw offset"], 180);
            UI.SetValue(["Rage", "Anti Aim", "General", "Pitch mode"], 0);
            this.legitAA = true;
        } else {
            UI.SetValue(["Config", "Cheat", "General", "Restrictions"], restrictions_cache);
            UI.SetValue(["Rage", "Anti Aim", "Directions", "Yaw offset"], yaw_cache);
            UI.SetValue(["Rage", "Anti Aim", "General", "Pitch mode"], pitch_cache);
            this.legitAA = false;

            if (!this.lowdelta && !this.presetAA) {
                AntiAim.SetOverride(0);
            }
        }
    },
    ideal_tick: function () {
        if (Exploit.GetCharge() == 1 && Keys.doubletap && Keys.idealtick) {
            if (canShiftShot(1) && Exploit.GetCharge() != 1) {
                UserCMD.Choke();
                Exploit.DisableRecharge();
                Exploit.Recharge();
            }
        }
    },
    auto_dir: function () {
        var autodir_disabler_opt = UI.GetValue(["Rage", "AA Disaster", "AA Disaster", "Auto Direction Disabler"]);

        var bhop = Input.IsKeyPressed(0x20);

        if (Keys.autodir) {
            UI.SetValue(["Rage", "Anti Aim", "Directions", "Auto direction"], 1);
            if (autodir_disabler_opt & 1 << 0) {
                if (is_standing(ent_Local.id)) {
                    UI.SetValue(["Rage", "Anti Aim", "Directions", "Auto direction"], 0);
                }
            }

            if (autodir_disabler_opt & 1 << 1) {
                if (Keys.slowwalk) {
                    UI.SetValue(["Rage", "Anti Aim", "Directions", "Auto direction"], 0);
                }
            }

            if (autodir_disabler_opt & 1 << 2) {
                if (bhop || is_inair(ent_Local.id) ) {
                    UI.SetValue(["Rage", "Anti Aim", "Directions", "Auto direction"], 0);
                }
            }

            if (autodir_disabler_opt & 1 << 3) {
                if ( Keys.legitaa ) {
                    UI.SetValue(["Rage", "Anti Aim", "Directions", "Auto direction"], 0);
                }
            }
        } else {
            UI.SetValue(["Rage", "Anti Aim", "Directions", "Auto direction"], 0);
        }
    },
    slowwalk : function(){
        if(!UI.GetValue(UI_List.checkbox_customslowwalk)) return;
        
        if(Keys.slowwalk)
        {
            var speed = UI.GetValue(UI_List.slider_sspeed)

            dir = [0, 0, 0];
            if (Input.IsKeyPressed(0x57)) { //W
                dir[0] += speed;
            }
            if (Input.IsKeyPressed(0x44)) { //S
                dir[1] += speed;
            }
            if (Input.IsKeyPressed(0x41)) { //A
                dir[1] -= speed;
            }
            if (Input.IsKeyPressed(0x53)) { //D
                dir[0] -= speed;
            }
            UserCMD.SetMovement(dir);  
        }
    },
}

const Visuals = {
    watermark_X: 0,
    watermark_Y: 0,

    keybind_X: 0,
    keybind_Y: 0,

    observators: [],
    spectator_X: 0,
    spectator_Y: 0,

    holopanel_X: 0,
    holopanel_Y: 0,


    crosshair_length: 0,
    crosshair_width: 0,
    crosshair_offset: 0,

    Update: function () {
        this.watermark_X = UI.GetValue(UI_List.sliderX_watermark);
        this.watermark_Y = UI.GetValue(UI_List.sliderY_watermark);

        this.keybind_X = UI.GetValue(UI_List.sliderX_keybind);
        this.keybind_Y = UI.GetValue(UI_List.sliderY_keybind);

        this.spectator_X = UI.GetValue(UI_List.sliderX_spectator);
        this.spectator_Y = UI.GetValue(UI_List.sliderY_spectator);

        this.holopanel_X = UI.GetValue(UI_List.sliderX_holopanel);
        this.holopanel_Y = UI.GetValue(UI_List.sliderY_holopanel);

        this.crosshair_length = UI.GetValue(UI_List.slider_length)
        this.crosshair_width = UI.GetValue(UI_List.slider_width)
        this.crosshair_offset = UI.GetValue(UI_List.slider_offset)
    },
    draw_flags: function () {
        weapon_config = UI.GetValue(UI_List.dropdown_weaponconfig)
        noscope_opt = UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[weapon_config] + "] Noscope modifiers"]);
        noscope_flag = UI.GetValue(UI_List.multidrop_customflags);
        var noscope_distance = UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[weapon_config] + "] Noscope distance"]);

        if (noscope_opt & 1 << 0) {
            enemies = Entity.GetEnemies();

            for (i in enemies) {
                if (get_metric_distance(Entity.GetRenderOrigin(ent_Local.id), Entity.GetRenderOrigin(enemies[i])) < noscope_distance) {
                    Entity.DrawFlag(enemies[i], "NO-SCOPE", UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Noscope Flag Color"]))
                }
            }
        }
    },
    render_flags : function ()
    {
        var font1 = Render.GetFont("CreteRound-Regular.ttf", 14, true)

        renderflags_opt = UI.GetValue(UI_List.multidrop_renderflags);

        if (renderflags_opt & 1 << 0 || renderflags_opt & 1 << 1 || renderflags_opt & 1 << 2 || renderflags_opt & 1 << 3 || renderflags_opt & 1 << 4 || renderflags_opt & 1 << 5 || renderflags_opt & 1 << 6 || renderflags_opt & 1 << 7)
        {
            
        }
        else
        {
            return;
        }

        weapon_config = UI.GetValue(UI_List.dropdown_weaponconfig)
        noscope_opt = UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[weapon_config] + "] Noscope modifiers"]);
        noscope_flag = UI.GetValue(UI_List.multidrop_customflags);
        noscope_distance = UI.GetValue(["Rage", "Advanced Config", "Advanced Config", "[" + weplist[weapon_config] + "] Noscope distance"]);

        enemies = Entity.GetEnemies();
        enemies_noscope = [];
        enemies_forcebaim = [];
        enemies_forcesafe = [];

        if (renderflags_opt & 1 << 0) {

            for (i = 0; i < enemies.length; i++) {
                enemies_noscope[i] = false;
                if (get_metric_distance(Entity.GetRenderOrigin(ent_Local.id), Entity.GetRenderOrigin(enemies[i])) < noscope_distance) 
                {
                    if( !Entity.IsAlive(enemies[i]) || Entity.IsDormant(enemies[i])) continue;

                    enemies_noscope[i] = true;

                    box_data = box(Entity.GetRenderBox(enemies[i]))

                    if (!box_data.valid) continue;

                    Render.String(box_data.top_center.x,box_data.top_center.y - 25, 1, "NO-SCOPE", UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Render Color"]), font1);
                }
            }
        }

        if (renderflags_opt & 1 << 6 && renderflags_opt & 1 << 7)
        {
            for (i in enemies) {
                enemies_forcebaim[i] = false;
                enemies_forcesafe[i] = false;
                if (Keys.force_baim && Keys.force_safepoint) 
                {
                    if( !Entity.IsAlive(enemies[i]) || Entity.IsDormant(enemies[i])) continue;
                    
                    if(enemies_noscope[i] == true) continue;

                    enemies_forcebaim[i] = true;
                    enemies_forcesafe[i] = true;

                    box_data = box(Entity.GetRenderBox(enemies[i]))

                    if (!box_data.valid) continue;

                    Render.String(box_data.top_center.x,box_data.top_center.y - 25, 1, "BAIM & SAFEPOINT", UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Render Color"]), font1);
                }
            }
        }
        else
        {
            if (renderflags_opt & 1 << 6)
            {
                for (i in enemies) {
                    enemies_forcebaim[i] = false;
                    if (Keys.force_baim) 
                    {
                        if( !Entity.IsAlive(enemies[i]) || Entity.IsDormant(enemies[i])) continue;
                        
                        if(enemies_noscope[i] == true) continue;

                        enemies_forcebaim[i] = true;

                        box_data = box(Entity.GetRenderBox(enemies[i]))

                        if (!box_data.valid) continue;

                        Render.String(box_data.top_center.x,box_data.top_center.y - 25, 1, "BAIM", UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Render Color"]), font1);
                    }
                }
            }

            if (renderflags_opt & 1 << 7)
            {
                for (i in enemies) {
                    enemies_forcesafe[i] = false;
                    if (Keys.force_safepoint) 
                    {
                        if( !Entity.IsAlive(enemies[i]) || Entity.IsDormant(enemies[i])) continue;
                        
                        if(enemies_noscope[i] == true) continue;

                        enemies_forcesafe[i] = true;

                        box_data = box(Entity.GetRenderBox(enemies[i]))

                        if (!box_data.valid) continue;

                        Render.String(box_data.top_center.x,box_data.top_center.y - 25, 1, "SAFEPOINT", UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Render Color"]), font1);
                    }
                }
            }
        }

        if (renderflags_opt & 1 << 1)
        {
            for (i in enemies) {
                if (is_standing(enemies[i])) 
                {
                    if( !Entity.IsAlive(enemies[i]) || Entity.IsDormant(enemies[i])) continue;

                    if(enemies_noscope[i] == true || enemies_forcebaim[i] == true || enemies_forcesafe[i] == true) continue;

                    box_data = box(Entity.GetRenderBox(enemies[i]))


                    if (!box_data.valid) continue;

                    Render.String(box_data.top_center.x,box_data.top_center.y - 25, 1, "STANDING", UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Render Color"]), font1);
                }
            }
        }

        if (renderflags_opt & 1 << 2)
        {
            for (i in enemies) {
                if (is_inair(enemies[i])) 
                {
                    if( !Entity.IsAlive(enemies[i]) || Entity.IsDormant(enemies[i])) continue;

                    if(enemies_noscope[i] == true || enemies_forcebaim[i] == true || enemies_forcesafe[i] == true) continue;

                    box_data = box(Entity.GetRenderBox(enemies[i]))

                    if (!box_data.valid) continue;

                    Render.String(box_data.top_center.x,box_data.top_center.y - 25, 1, "IN-AIR", UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Render Color"]), font1);
                }
            }
        }

        if (renderflags_opt & 1 << 3)
        {
            for (i in enemies) {
                if (is_crouching(enemies[i]) && !is_inair(enemies[i])) 
                {
                    if( !Entity.IsAlive(enemies[i]) || Entity.IsDormant(enemies[i])) continue;

                    if(enemies_noscope[i] == true || enemies_forcebaim[i] == true || enemies_forcesafe[i] == true) continue;

                    box_data = box(Entity.GetRenderBox(enemies[i]))

                    if (!box_data.valid) continue;

                    Render.String(box_data.top_center.x,box_data.top_center.y - 25, 1, "CROUCH", UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Render Color"]), font1);
                }
            }
        }

        if (renderflags_opt & 1 << 4)
        {
            for (i in enemies) {
                if (is_walking(enemies[i]) && !is_inair(enemies[i]) && !is_crouching(enemies[i])) 
                {
                    if( !Entity.IsAlive(enemies[i]) || Entity.IsDormant(enemies[i])) continue;

                    if(enemies_noscope[i] == true || enemies_forcebaim[i] == true || enemies_forcesafe[i] == true) continue;

                    box_data = box(Entity.GetRenderBox(enemies[i]))

                    if (!box_data.valid) continue;

                    Render.String(box_data.top_center.x,box_data.top_center.y - 25, 1, "SLOW-WALK", UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Render Color"]), font1);
                }
            }
        }

        if (renderflags_opt & 1 << 5)
        {
            for (i in enemies) {
                if (is_moving(enemies[i]) && !is_inair(enemies[i]) && !is_walking(enemies[i]) && !is_crouching(enemies[i])) 
                {
                    if( !Entity.IsAlive(enemies[i]) || Entity.IsDormant(enemies[i])) continue;
                    
                    if(enemies_noscope[i] == true || enemies_forcebaim[i] == true || enemies_forcesafe[i] == true) continue;

                    box_data = box(Entity.GetRenderBox(enemies[i]))

                    if (!box_data.valid) continue;

                    Render.String(box_data.top_center.x,box_data.top_center.y - 25, 1, "MOVING", UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Render Color"]), font1);
                }
            }
        }

        enemies_noscope = [];
    },
    Watermark: function () {
        /*
        var font1 = Render.GetFont("AlfaSlabOne-Regular.ttf", 15, true)
        var font2 = Render.GetFont("CreteRound-Regular.ttf", 15, true)
        */


        var icon_font1 = Render.GetFont("icons.ttf", 14, true)
        var font1 = Render.GetFont("AlfaSlabOne-Regular.ttf", 14, true)
        var font2 = Render.GetFont("lexend.ttf", 14, true)

        var watermark_text = "";

        if (UI.GetValue(UI_List.checkbox_watermark)) {
            var size_title = Render.TextSize("Disaster |", font1)
            var size_content = Render.TextSize(username, font2)
            var whole_size = size_title[0] + size_content[0]

            Render.FilledRect(this.watermark_X - 2 , this.watermark_Y, whole_size + 35, 10, UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Watermark Color 1"]));
            Render.FilledRect(this.watermark_X - 2 , this.watermark_Y + 3, whole_size + 35, 22, UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Watermark Color 2"]));

            /*
            Render.FilledRoundRect( this.watermark_X, this.watermark_Y, whole_size + 50, 10, UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Watermark Color 1"]));
            Render.FilledRoundRect( this.watermark_X - 2 , this.watermark_Y + 3, whole_size + 54, 20, UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Watermark Color 2"]));
            */

            Render.String(this.watermark_X + 8, this.watermark_Y + 5, 0, "Disaster", UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Watermark Font Color"]), font1)
            Render.String(this.watermark_X + 75, this.watermark_Y + 7, 0, "c", UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Watermark Icon Color"]), icon_font1)
            Render.String(this.watermark_X + 95, this.watermark_Y + 5, 0, username, UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Watermark Font Color"]), font2)


            if (Input.IsKeyPressed(1) && UI.IsMenuOpen()) {
                const mouse_pos = Input.GetCursorPosition();
                if (InBounds(this.watermark_X, this.watermark_Y, whole_size + 55, 35)) {
                    UI.SetValue(["Visuals", "Visual Disaster", "Visual Disaster", "Watermark-X"], mouse_pos[0] - (whole_size + 55) / 2);
                    UI.SetValue(["Visuals", "Visual Disaster", "Visual Disaster", "Watermark-Y"], mouse_pos[1] - 16);
                }
            }
            /*
            Render.GradientRect(this.watermark_X, this.watermark_Y, whole_size + 25, 30, 1, UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Watermark Color 1"]), UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Watermark Color 2"]));

            Render.String(this.watermark_X + 10, this.watermark_Y + 5.7, 0, "Disaster |", UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Watermark Font Color"]), font1)
            Render.String(this.watermark_X + 90, this.watermark_Y + 6, 0, username, UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Watermark Font Color"]), font2)

            if (Input.IsKeyPressed(1) && UI.IsMenuOpen()) {
                const mouse_pos = Input.GetCursorPosition();
                if (InBounds(this.watermark_X, this.watermark_Y, 310, 40)) {
                    UI.SetValue(["Visuals", "Visual Disaster", "Visual Disaster", "Watermark-X"], mouse_pos[0] - (whole_size + 25) / 2);
                    UI.SetValue(["Visuals", "Visual Disaster", "Visual Disaster", "Watermark-Y"], mouse_pos[1] - 15);
                }
            }
            */
        }
    },
    Keybind: function () {
        if (!Entity.IsAlive(ent_Local.id)) return;

        /*
        var font1 = Render.GetFont("CreteRound-Regular.ttf", 14, true)
        var font2 = Render.GetFont("CreteRound-Regular.ttf", 12, true)
        */

        var icon_font1 = Render.GetFont("icons.ttf", 16, true)
        var icon_font2 = Render.GetFont("icons.ttf", 14, true)
        var font1 = Render.GetFont("lexend.ttf", 14, true)
        var font2 = Render.GetFont("lexend.ttf", 11, true)

        if (UI.GetValue(UI_List.checkbox_keybind)) {
            var keybind_list = [];


            if (Keys.override_resolver) {
                keybind_list.splice(0, 0, "Resolver Override");
            }
            if (Keys.force_baim) {
                keybind_list.splice(1, 0, "Force Baim");
            }
            i
            if (Keys.force_safepoint) {
                keybind_list.splice(2, 0, "Force Safe Point");
            }
            if (Keys.override_dmg) {
                keybind_list.splice(3, 0, "Damage Override");
            }
            if (Keys.override_hitbox) {
                keybind_list.splice(4, 0, "Hitbox Override");
            }
            if (Keys.override_hc) {
                keybind_list.splice(5, 0, "Hitchance Override");
            }
            if (Keys.doubletap) {
                keybind_list.splice(6, 0, "Doubletap");
            }
            if (Keys.hideshot) {
                keybind_list.splice(7, 0, "Hideshot");
            }
            if (Keys.left_direction) {
                keybind_list.splice(7, 0, "Left Yaw");
            }
            if (Keys.back_direction) {
                keybind_list.splice(8, 0, "Back Yaw");
            }
            if (Keys.right_direction) {
                keybind_list.splice(10, 0, "Right Yaw");
            }
            if (Keys.mouse_direction) {
                keybind_list.splice(11, 0, "Mouse Direction");
            }
            if (Keys.aa_invert) {
                keybind_list.splice(12, 0, "Inverted");
            }
            if (Keys.jitter) {
                keybind_list.splice(13, 0, "Jitter");
            }
            if (Keys.slowwalk) {
                keybind_list.splice(14, 0, "Slow Walk");
            }
            if (Keys.fakeduck) {
                keybind_list.splice(15, 0, "Fake Duck");
            }
            if (Keys.lowdelta) {
                keybind_list.splice(16, 0, "Low Delta");
            }
            if (Keys.legitaa) {
                keybind_list.splice(17, 0, "Legit AA");
            }
            if (Keys.idealtick) {
                keybind_list.splice(18, 0, "Ideal Tick");
            }
            if (Keys.autodir) {
                keybind_list.splice(19, 0, "Auto Direction");
            }
            if (Keys.edge_jump) {
                keybind_list.splice(20, 0, "Edge Jump");
            }
            if (Keys.auto_peek) {
                keybind_list.splice(21, 0, "Auto Peek");
            }
            if (Keys.thirdperson) {
                keybind_list.splice(22, 0, "Thirdperson");
            }
            if (Keys.zoom) {
                keybind_list.splice(23, 0, "Zoom");
            }
            if (Keys.freecam) {
                keybind_list.splice(24, 0, "Freecam");
            }

            if (keybind_list.length == 0)
            {
                if(UI.IsMenuOpen())
                {
                    Render.FilledRect( this.keybind_X, this.keybind_Y, 184, 10, UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Keybind Color 1"]));
                    Render.FilledRect( this.keybind_X, this.keybind_Y + 3, 184, 20, UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Keybind Color 2"]));
        
                    Render.String(this.keybind_X + 7.5, this.keybind_Y + 6, 0, "a", UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Keybind Icon Color 1"]), icon_font1)
                    Render.String(this.keybind_X + 30, this.keybind_Y + 4, 0, "Keybinds", UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Keybind Title Color"]), font1)
                }
            }
            else
            {
                Render.FilledRect( this.keybind_X, this.keybind_Y, 184, 10, UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Keybind Color 1"]));
                Render.FilledRect( this.keybind_X, this.keybind_Y + 3, 184, 20, UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Keybind Color 2"]));
        
                Render.String(this.keybind_X + 7.5, this.keybind_Y + 6, 0, "a", UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Keybind Icon Color 1"]), icon_font1)
                Render.String(this.keybind_X + 30, this.keybind_Y + 4, 0, "Keybinds", UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Keybind Title Color"]), font1)

                for (var i = 0; i < keybind_list.length; i++) {
                    Render.String(this.keybind_X + 13, (this.keybind_Y + 25) + (i * 20), 0, "f", UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Keybind Icon Color 2"]), icon_font2)
                    Render.String(this.keybind_X + 35, (this.keybind_Y + 28) + (i * 20), 0, keybind_list[i], UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Keybind Content Color"]), font2);
                }
            }

            if (Input.IsKeyPressed(1) && UI.IsMenuOpen()) {
                const mouse_pos = Input.GetCursorPosition();
                if (InBounds(this.keybind_X, this.keybind_Y, 191, 31)) {
                    UI.SetValue(["Visuals", "Visual Disaster", "Visual Disaster", "Keybind-X"], mouse_pos[0] - 95.5);
                    UI.SetValue(["Visuals", "Visual Disaster", "Visual Disaster", "Keybind-Y"], mouse_pos[1] - 15);
                }
            }

            /*
            Render.GradientRect(this.keybind_X, this.keybind_Y, 180, 25, 1, UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Keybind Color 1"]), UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Keybind Color 2"]));
            Render.String(this.keybind_X + 10, this.keybind_Y + 3, 0, ">  Keybinds", UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Keybind Font Color"]), font1)
            if (keybind_list.length == 0) {

            } else {
                Render.FilledRect(this.keybind_X, this.keybind_Y + 27, 180, keybind_list.length * 21.5, UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Keybind Color 2"]));
            }

            for (var i = 0; i < keybind_list.length; i++) {
                Render.String(this.keybind_X + 25, (this.keybind_Y + 30) + (i * 21.5), 1, " -> ", UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Keybind Font Color"]), font2);
                Render.String(this.keybind_X + 90, (this.keybind_Y + 30) + (i * 21.5), 1, keybind_list[i], UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Keybind Font Color"]), font2);
            }

            if (Input.IsKeyPressed(1) && UI.IsMenuOpen()) {
                const mouse_pos = Input.GetCursorPosition();
                if (InBounds(this.keybind_X, this.keybind_Y, 190, 35)) {
                    UI.SetValue(["Visuals", "Visual Disaster", "Visual Disaster", "Keybind-X"], mouse_pos[0] - 95);
                    UI.SetValue(["Visuals", "Visual Disaster", "Visual Disaster", "Keybind-Y"], mouse_pos[1] - 17.5);
                }
            }
            */
        }
    },
    getSpectator: function () {
        var ents = Entity.GetPlayers();
        var localtarget = Entity.GetProp(ent_Local.id, "DT_BasePlayer", "m_hObserverTarget");
        if (!ent_Local.id) return;

        this.observators = [];

        for (i = 0; i < ents.length; i++) {
            if (Entity.IsAlive(ent_Local.id)) {
                if (!ents[i] || Entity.IsAlive(ents[i])) {
                    continue;
                }

                var observer = Entity.GetProp(ents[i], "DT_BasePlayer", "m_hObserverTarget");

                if (!observer || observer == "m_hObserverTarget") {
                    continue;
                }

                if (observer == ent_Local.id && !Entity.IsDormant(ents[i])) {
                    this.observators.push(Entity.GetName(ents[i]));
                }
            } else {
                if (!ents[i] || Entity.IsAlive(ents[i])) {
                    continue;
                }

                var observer = Entity.GetProp(ents[i], "DT_BasePlayer", "m_hObserverTarget");

                if (!observer || observer == "m_hObserverTarget") {
                    continue;
                }

                if (observer == localtarget && !Entity.IsDormant(ents[i])) {
                    this.observators.push(Entity.GetName(ents[i]));
                }
            }
        }
    },
    drawSpectator: function () {
        if (!Entity.IsAlive(ent_Local.id)) return;

        /*
        var font1 = Render.GetFont("CreteRound-Regular.ttf", 14, true)
        var font2 = Render.GetFont("CreteRound-Regular.ttf", 12, true)
        */

        var icon_font1 = Render.GetFont("icons.ttf", 16, true)
        var icon_font2 = Render.GetFont("icons.ttf", 14, true)
        var font1 = Render.GetFont("Verdana.ttf", 14, true)
        var font2 = Render.GetFont("Verdana.ttf", 11, true)

        if (UI.GetValue(UI_List.checkbox_spectator)) {
            if (this.observators.length == 0) {
                if(UI.IsMenuOpen())
                {
                    Render.FilledRect( this.spectator_X, this.spectator_Y, 184, 10, UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Spectator Color 1"]));
                    Render.FilledRect( this.spectator_X, this.spectator_Y + 3, 184, 20, UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Spectator Color 2"]));

                    Render.String(this.spectator_X + 7.5, this.spectator_Y + 6, 0, "A", UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Spectator Icon Color 1"]), icon_font1)
                    Render.String(this.spectator_X + 30, this.spectator_Y + 4, 0, "Spectators", UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Spectator Title Color"]), font1)
                }
            } else {
                Render.FilledRect( this.spectator_X, this.spectator_Y, 184, 10, UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Spectator Color 1"]));
                Render.FilledRect( this.spectator_X, this.spectator_Y + 3, 184, 20, UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Spectator Color 2"]));

                Render.String(this.spectator_X + 7.5, this.spectator_Y + 6, 0, "A", UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Spectator Icon Color 1"]), icon_font1)
                Render.String(this.spectator_X + 30, this.spectator_Y + 4, 0, "Spectators", UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Spectator Title Color"]), font1)

                for (var i = 0; i < this.observators.length; i++) {
                    Render.String(this.spectator_X + 13, (this.spectator_Y + 25) + (i * 20), 0, "f", UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Spectator Icon Color 2"]), icon_font2)
                    Render.String(this.spectator_X + 30, (this.spectator_Y + 27) + (i * 20), 0, "C", UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Spectator Icon Color 2"]), icon_font2)
                    Render.String(this.spectator_X + 47, (this.spectator_Y + 28) + (i * 20), 0, this.observators[i], UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Spectator Content Color"]), font2);
                }
            }

            if (Input.IsKeyPressed(1) && UI.IsMenuOpen()) {
                const mouse_pos = Input.GetCursorPosition();
                if (InBounds(this.spectator_X, this.spectator_Y, 191, 31)) {
                    UI.SetValue(["Visuals", "Visual Disaster", "Visual Disaster", "Spectator-X"], mouse_pos[0] - 95.5);
                    UI.SetValue(["Visuals", "Visual Disaster", "Visual Disaster", "Spectator-Y"], mouse_pos[1] - 15);
                }
            }

            /*
            Render.GradientRect(this.spectator_X, this.spectator_Y, 180, 25, 1, UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Spectator Color 1"]), UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Spectator Color 2"]));
            Render.String(this.spectator_X + 10, this.spectator_Y + 3, 0, ">  Spectators", UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Spectator Font Color"]), font1)
            if (this.observators.length == 0) {

            } else {
                Render.FilledRect(this.spectator_X, this.spectator_Y + 27, 180, this.observators.length * 21.5, UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Spectator Color 2"]));
            }

            for (var i = 0; i < this.observators.length; i++) {
                Render.String(this.spectator_X + 25, (this.spectator_Y + 30) + (i * 21.5), 1, " -> ", UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Spectator Font Color"]), font2);
                Render.String(this.spectator_X + 90, (this.spectator_Y + 30) + (i * 21.5), 1, this.observators[i], UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Spectator Font Color"]), font2);
            }

            if (Input.IsKeyPressed(1) && UI.IsMenuOpen()) {
                const mouse_pos = Input.GetCursorPosition();
                if (InBounds(this.spectator_X, this.spectator_Y, 190, 35)) {
                    UI.SetValue(["Visuals", "Visual Disaster", "Visual Disaster", "Spectator-X"], mouse_pos[0] - 95);
                    UI.SetValue(["Visuals", "Visual Disaster", "Visual Disaster", "Spectator-Y"], mouse_pos[1] - 17.5);
                }
            }
            */
        }
    },
    crosshair: function () {
        if (UI.GetValue(UI_List.checkbox_crosshair)) {
            if (!Entity.IsAlive(ent_Local.id) || !World.GetServerString()) {
                Convar.SetFloat("r_drawvgui", 1);
                Convar.SetInt("fov_cs_debug", 0);
                UI.SetValue(["Visuals", "Extra", "Removals", "Removals"], 63);
                return;
            }

            var fov = UI.GetValue(["Misc.", "View", "Camera", "Field of view"]);
            var fovDifference = 90 - fov;
            var fovScope = 90 + fovDifference;

            if (ent_Local.is_scoped) {
                Convar.SetFloat("r_drawvgui", 0);
                if (!Keys.thirdperson)
                    Convar.SetInt("fov_cs_debug", fovScope);
                else {
                    Convar.SetInt("fov_cs_debug", 0);
                }
                UI.SetValue(["Visuals", "Extra", "Removals", "Removals"], 59);

                Render.GradientRect(screen_width / 2 - (this.crosshair_width / 2), screen_height / 2 + this.crosshair_offset, this.crosshair_width, this.crosshair_length, 0, UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Crosshair Color 1"]), UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Crosshair Color 2"])); //down
                Render.GradientRect(screen_width / 2 - (this.crosshair_width / 2), screen_height / 2 - this.crosshair_offset - this.crosshair_length, this.crosshair_width, this.crosshair_length, 0, UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Crosshair Color 2"]), UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Crosshair Color 1"])); //up
                Render.GradientRect(screen_width / 2 + this.crosshair_offset, screen_height / 2 - (this.crosshair_width / 2), this.crosshair_length, this.crosshair_width, 1, UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Crosshair Color 1"]), UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Crosshair Color 2"])); //right
                Render.GradientRect(screen_width / 2 - this.crosshair_offset - this.crosshair_length, screen_height / 2 - (this.crosshair_width / 2), this.crosshair_length, this.crosshair_width, 1, UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Crosshair Color 2"]), UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Crosshair Color 1"])); //left
            } else {
                Convar.SetFloat("r_drawvgui", 1);
                Convar.SetInt("fov_cs_debug", 0);
                UI.SetValue(["Visuals", "Extra", "Removals", "Removals"], 63);
            }
        }
    },
    indicator: function () {
        if (!Entity.IsAlive(ent_Local.id)) return;

        if (UI.GetValue(UI_List.checkbox_indicator)) {
            var font_arrow = Render.GetFont("Arrows.ttf", 30, true)
            var font1 = Render.GetFont("lexend.ttf", 16, true)
            var font3 = Render.GetFont("lexend.ttf", 14, true)
            var font2 = Render.GetFont("lexend.ttf", 12, true)
            var col1 = UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Indicator Enabled Color"]);
            var col2 = UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Indicator Disabled Color"]);
            var col3 = UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Indicator Desync Bar 1"]);
            var col4 = UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Indicator Desync Bar 2"]);
            var col5 = UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Indicator Real Arrow"]);
            var col6 = UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Indicator Fake Arrow"]);

            var aa_mode = "";
            const dsy = Math.abs(Normalize(Local.GetRealYaw() - Local.GetFakeYaw()) / 2);

            if (AA.presetAA) {
                if (AA.lowdelta) {
                    if (AA.legitAA) {
                        aa_mode = "Legit"
                    } else {
                        aa_mode = "Low Delta"
                    }
                } else {
                    if (AA.legitAA) {
                        aa_mode = "Legit"
                    } else {
                        aa_mode = presetmode[UI.GetValue(UI_List.dropdown_presetAA)]
                    }
                }
            } else {
                if (AA.lowdelta) {
                    if (AA.legitAA) {
                        aa_mode = "Legit"
                    } else {
                        aa_mode = "Low Delta"
                    }
                } else {
                    if (AA.legitAA) {
                        aa_mode = "Legit"
                    } else {
                        aa_mode = "Default"
                    }
                }
            }

            var x = 0;

            if(Keys.thirdperson)
            {
                var x = screen_width + 550
            }
            else
            {
                var x = screen_width
            }

            Render.String((x / 2) - 50, (screen_height / 2) - 10, 1, "b", Keys.aa_invert ? col6 : col5, font_arrow)
            Render.String((x / 2) + 50, (screen_height / 2) - 10, 1, "a", Keys.aa_invert ? col5 : col6, font_arrow)

            Render.String((x / 2), (screen_height / 2) + 7, 1, "Disaster", UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Indicator Title Color"]), font1)
            Render.String((x / 2), (screen_height / 2) + 26, 1, aa_mode + "(" + dsy.toFixed(2) + "')", UI.GetColor(["Visuals", "Visual Disaster", "Visual Disaster", "Indicator AA Mode Color"]), font3)

            Render.GradientRect((x / 2), (screen_height / 2) + 45, (70 / 60) * dsy, 4, 1, col3, col4);
            Render.GradientRect((x / 2) - (70 / 60) * dsy + 1, (screen_height / 2) + 45, (70 / 60) * dsy, 4, 1, col4, col3);

            Render.String((x / 2), (screen_height / 2) + 51, 1, "Doubletap", Keys.doubletap && Exploit.GetCharge() == 1 ? col1 : col2, font2)
            Render.String((x / 2), (screen_height / 2) + 65, 1, "Onshot", Keys.hideshot ? col1 : col2, font2)
            
            for (weapon in wep2index) {
                if (weapon == ent_Local.weapon_name) {
                    if(Keys.override_dmg)
                    {
                        var dmg = UI.GetValue(["Rage", "Overrides", weplist[wep2index[weapon]], "Minimum damage (on key)"])
                    }
                    else
                    {
                        var dmg = UI.GetValue(["Rage", "Target", weplist[wep2index[weapon]], "Minimum damage"])
                    }
                    break;
                }
            }
            if (typeof dmg == 'undefined')
            {
                dmg = 0;
            }

            Render.String((x / 2), (screen_height / 2) + 80, 1, "Min Damage - " + dmg, Keys.override_dmg ? col1 : col2, font2)
            Render.String((x / 2), (screen_height / 2) + 95, 1, "Fake Duck", Keys.fakeduck ? col1 : col2, font2)
            Render.String((x / 2), (screen_height / 2) + 110, 1, "Ideal Tick", Keys.idealtick ? col1 : col2, font2)
        }
    },
    thunder_strike: function () {
        if (UI.GetValue(UI_List.checkbox_tstrike)) {
            var hit = Entity.GetEntityFromUserID(Event.GetInt("userid"));
            var attacker = Entity.GetEntityFromUserID(Event.GetInt("attacker"));

            if (attacker == ent_Local.id) {
                var pos = Entity.GetRenderOrigin(hit);
                World.CreateLightningStrike(true, pos);
            }
        }
    },
    custom_chams: function () {
        if (UI.GetValue(UI_List.checkbox_customchams)) {
            Material.Create("Local - Visible");
            Material.Create("Local - Attachments");
            Material.Create("Local - Desync");
            Material.Create("Local - Fakelag");
            Material.Create("Local - Arms");
            Material.Create("Local - Weapon");

            Material.Create("Enemy - Visible");
            Material.Create("Enemy - Hidden");
            Material.Create("Enemy - Attachments");
            Material.Create("Enemy - History");

            if (Globals.Tickcount() % 4 != 0) return;

            const cl_visible = UI.GetColor(UI_List.colorpicker_self_visible)
            const cl_attachments = UI.GetColor(UI_List.colorpicker_self_attachments)
            const cl_desync = UI.GetColor(UI_List.colorpicker_self_desync)
            const cl_fakelag = UI.GetColor(UI_List.colorpicker_self_fakelag)
            const cl_arms = UI.GetColor(UI_List.colorpicker_self_arms)
            const cl_weapons = UI.GetColor(UI_List.colorpicker_self_weapon)

            const li_visible = (100 - UI.GetValue(UI_List.slider_self_intensity_visible) + 5) / 100;
            const li_attachments = (100 - UI.GetValue(UI_List.slider_self_intensity_attachments) + 5) / 100;
            const li_desync = (100 - UI.GetValue(UI_List.slider_self_intensity_desync) + 5) / 100;
            const li_fakelag = (100 - UI.GetValue(UI_List.slider_self_intensity_fakelag) + 5) / 100;
            const li_arms = (100 - UI.GetValue(UI_List.slider_self_intensity_arms) + 5) / 100;
            const li_weapons = (100 - UI.GetValue(UI_List.slider_self_intensity_weapon) + 5) / 100;

            const il_visible = Material.Get("Local - Visible");
            const il_attachments = Material.Get("Local - Attachments");
            const il_desync = Material.Get("Local - Desync");
            const il_fakelag = Material.Get("Local - Fakelag");
            const il_arms = Material.Get("Local - Arms");
            const il_weapon = Material.Get("Local - Weapon");

            Material.SetKeyValue(il_visible, "$baseTexture", "vgui/white");
            Material.SetKeyValue(il_visible, "$envmap", "models/effects/cube_white");
            Material.SetKeyValue(il_visible, "$envmapfresnel", "1");
            Material.SetKeyValue(il_visible, "$envmapfresnelminmaxexp", Format("[0 % %]", [li_visible * 4, li_visible * 8]));
            Material.SetKeyValue(il_visible, "$color", "[1.0 1.0 1.0]");
            Material.SetKeyValue(il_visible, "$envmaptint", Format("[% % %]", [cl_visible[0] / 255, cl_visible[1] / 255, cl_visible[2] / 255]));
            Material.SetKeyValue(il_visible, "$alpha", (cl_visible[3] / 255).toString());

            Material.Refresh(il_visible);

            Material.SetKeyValue(il_attachments, "$baseTexture", "vgui/white");
            Material.SetKeyValue(il_attachments, "$envmap", "models/effects/cube_white");
            Material.SetKeyValue(il_attachments, "$envmapfresnel", "1");
            Material.SetKeyValue(il_attachments, "$envmapfresnelminmaxexp", Format("[0 % %]", [li_attachments * 4, li_attachments * 8]));
            Material.SetKeyValue(il_attachments, "$color", "[1.0 1.0 1.0]");
            Material.SetKeyValue(il_attachments, "$envmaptint", Format("[% % %]", [cl_attachments[0] / 255, cl_attachments[1] / 255, cl_attachments[2] / 255]));
            Material.SetKeyValue(il_attachments, "$alpha", (cl_attachments[3] / 255).toString());

            Material.Refresh(il_attachments);

            Material.SetKeyValue(il_desync, "$baseTexture", "vgui/white");
            Material.SetKeyValue(il_desync, "$envmap", "models/effects/cube_white");
            Material.SetKeyValue(il_desync, "$envmapfresnel", "1");
            Material.SetKeyValue(il_desync, "$envmapfresnelminmaxexp", Format("[0 % %]", [li_desync * 4, li_desync * 8]));
            Material.SetKeyValue(il_desync, "$color", "[1.0 1.0 1.0]");
            Material.SetKeyValue(il_desync, "$envmaptint", Format("[% % %]", [cl_desync[0] / 255, cl_desync[1] / 255, cl_desync[2] / 255]));
            Material.SetKeyValue(il_desync, "$alpha", (cl_desync[3] / 255).toString());

            Material.Refresh(il_desync);

            Material.SetKeyValue(il_fakelag, "$baseTexture", "vgui/white");
            Material.SetKeyValue(il_fakelag, "$envmap", "models/effects/cube_white");
            Material.SetKeyValue(il_fakelag, "$envmapfresnel", "1");
            Material.SetKeyValue(il_fakelag, "$envmapfresnelminmaxexp", Format("[0 % %]", [li_fakelag * 4, li_fakelag * 8]));
            Material.SetKeyValue(il_fakelag, "$color", "[1.0 1.0 1.0]");
            Material.SetKeyValue(il_fakelag, "$envmaptint", Format("[% % %]", [cl_fakelag[0] / 255, cl_fakelag[1] / 255, cl_fakelag[2] / 255]));
            Material.SetKeyValue(il_fakelag, "$alpha", (cl_fakelag[3] / 255).toString());

            Material.Refresh(il_fakelag);

            Material.SetKeyValue(il_arms, "$baseTexture", "vgui/white");
            Material.SetKeyValue(il_arms, "$envmap", "models/effects/cube_white");
            Material.SetKeyValue(il_arms, "$envmapfresnel", "1");
            Material.SetKeyValue(il_arms, "$envmapfresnelminmaxexp", Format("[0 % %]", [li_arms * 4, li_arms * 8]));
            Material.SetKeyValue(il_arms, "$color", "[1.0 1.0 1.0]");
            Material.SetKeyValue(il_arms, "$envmaptint", Format("[% % %]", [cl_arms[0] / 255, cl_arms[1] / 255, cl_arms[2] / 255]));
            Material.SetKeyValue(il_arms, "$alpha", (cl_arms[3] / 255).toString());

            Material.Refresh(il_arms);

            Material.SetKeyValue(il_weapon, "$baseTexture", "vgui/white");
            Material.SetKeyValue(il_weapon, "$envmap", "models/effects/cube_white");
            Material.SetKeyValue(il_weapon, "$envmapfresnel", "1");
            Material.SetKeyValue(il_weapon, "$envmapfresnelminmaxexp", Format("[0 % %]", [li_weapons * 4, li_weapons * 8]));
            Material.SetKeyValue(il_weapon, "$color", "[1.0 1.0 1.0]");
            Material.SetKeyValue(il_weapon, "$envmaptint", Format("[% % %]", [cl_weapons[0] / 255, cl_weapons[1] / 255, cl_weapons[2] / 255]));
            Material.SetKeyValue(il_weapon, "$alpha", (cl_weapons[3] / 255).toString());

            Material.Refresh(il_weapon);

            const ce_visible = UI.GetColor(UI_List.colorpicker_enemy_visible)
            const ce_hidden = UI.GetColor(UI_List.colorpicker_enemy_hidden)
            const ce_attachments = UI.GetColor(UI_List.colorpicker_enemy_attachments)
            const ce_history = UI.GetColor(UI_List.colorpicker_enemy_history)

            const le_visible = (100 - UI.GetValue(UI_List.slider_enemy_intensity_visible) + 5) / 100;
            const le_hidden = (100 - UI.GetValue(UI_List.slider_enemy_intensity_hidden) + 5) / 100;
            const le_attachments = (100 - UI.GetValue(UI_List.slider_enemy_intensity_attachments) + 5) / 100;
            const le_history = (100 - UI.GetValue(UI_List.slider_enemy_intensity_history) + 5) / 100;

            const ie_visible = Material.Get("Enemy - Visible");
            const ie_hidden = Material.Get("Enemy - Hidden");
            const ie_attachments = Material.Get("Enemy - Attachments");
            const ie_history = Material.Get("Enemy - History");

            Material.SetKeyValue(ie_visible, "$baseTexture", "vgui/white");
            Material.SetKeyValue(ie_visible, "$envmap", "models/effects/cube_white");
            Material.SetKeyValue(ie_visible, "$envmapfresnel", "1");
            Material.SetKeyValue(ie_visible, "$envmapfresnelminmaxexp", Format("[0 % %]", [le_visible * 4, le_visible * 8]));
            Material.SetKeyValue(ie_visible, "$color", "[1.0 1.0 1.0]");
            Material.SetKeyValue(ie_visible, "$envmaptint", Format("[% % %]", [ce_visible[0] / 255, ce_visible[1] / 255, ce_visible[2] / 255]));
            Material.SetKeyValue(ie_visible, "$alpha", (ce_visible[3] / 255).toString());

            Material.Refresh(ie_visible);

            Material.SetKeyValue(ie_hidden, "$baseTexture", "vgui/white");
            Material.SetKeyValue(ie_hidden, "$envmap", "models/effects/cube_white");
            Material.SetKeyValue(ie_hidden, "$envmapfresnel", "1");
            Material.SetKeyValue(ie_hidden, "$envmapfresnelminmaxexp", Format("[0 % %]", [le_hidden * 4, le_hidden * 8]));
            Material.SetKeyValue(ie_hidden, "$color", "[1.0 1.0 1.0]");
            Material.SetKeyValue(ie_hidden, "$envmaptint", Format("[% % %]", [ce_hidden[0] / 255, ce_hidden[1] / 255, ce_hidden[2] / 255]));
            Material.SetKeyValue(ie_hidden, "$alpha", (ce_hidden[3] / 255).toString());

            Material.Refresh(ie_hidden);
            
            Material.SetKeyValue(ie_attachments, "$baseTexture", "vgui/white");
            Material.SetKeyValue(ie_attachments, "$envmap", "models/effects/cube_white");
            Material.SetKeyValue(ie_attachments, "$envmapfresnel", "1");
            Material.SetKeyValue(ie_attachments, "$envmapfresnelminmaxexp", Format("[0 % %]", [le_attachments * 4, le_attachments * 8]));
            Material.SetKeyValue(ie_attachments, "$color", "[1.0 1.0 1.0]");
            Material.SetKeyValue(ie_attachments, "$envmaptint", Format("[% % %]", [ce_attachments[0] / 255, ce_attachments[1] / 255, ce_attachments[2] / 255]));
            Material.SetKeyValue(ie_attachments, "$alpha", (ce_attachments[3] / 255).toString());

            Material.Refresh(ie_attachments);

            Material.SetKeyValue(ie_history, "$baseTexture", "vgui/white");
            Material.SetKeyValue(ie_history, "$envmap", "models/effects/cube_white");
            Material.SetKeyValue(ie_history, "$envmapfresnel", "1");
            Material.SetKeyValue(ie_history, "$envmapfresnelminmaxexp", Format("[0 % %]", [le_history * 4, le_history * 8]));
            Material.SetKeyValue(ie_history, "$color", "[1.0 1.0 1.0]");
            Material.SetKeyValue(ie_history, "$envmaptint", Format("[% % %]", [ce_history[0] / 255, ce_history[1] / 255, ce_history[2] / 255]));
            Material.SetKeyValue(ie_history, "$alpha", (ce_history[3] / 255).toString());

            Material.Refresh(ie_history);
            /*

            const c = UI.GetColor(UI_List.colorpicker_self),
                i = (100 - UI.GetValue(UI_List.slider_self_intensity) + 5) / 100;
            const d = UI.GetColor(UI_List.colorpicker_enemy),
                j = (100 - UI.GetValue(UI_List.slider_enemy_intensity) + 5) / 100;

            const il_visible = Material.Get("Local - Visible");
            const index_enemy = Material.Get("Custom (Enemy)");
            */

            /*
            Material.SetKeyValue(il_visible, "$baseTexture", "vgui/white");
            Material.SetKeyValue(il_visible, "$envmap", "models/effects/cube_white");
            Material.SetKeyValue(il_visible, "$envmapfresnel", "1");
            Material.SetKeyValue(il_visible, "$envmapfresnelminmaxexp", Format("[0 % %]", [i * 4, i * 8]));
            Material.SetKeyValue(il_visible, "$color", "[1.0 1.0 1.0]");
            Material.SetKeyValue(il_visible, "$envmaptint", Format("[% % %]", [c[0] / 255, c[1] / 255, c[2] / 255]));
            Material.SetKeyValue(il_visible, "$alpha", (c[3] / 255).toString());

            Material.Refresh(il_visible);

            Material.SetKeyValue(index_enemy, "$baseTexture", "vgui/white");
            Material.SetKeyValue(index_enemy, "$envmap", "models/effects/cube_white");
            Material.SetKeyValue(index_enemy, "$envmapfresnel", "1");
            Material.SetKeyValue(index_enemy, "$envmapfresnelminmaxexp", Format("[0 % %]", [j * 4, j * 8]));
            Material.SetKeyValue(index_enemy, "$color", "[1.0 1.0 1.0]");
            Material.SetKeyValue(index_enemy, "$envmaptint", Format("[% % %]", [d[0] / 255, d[1] / 255, d[2] / 255]));
            Material.SetKeyValue(index_enemy, "$alpha", (d[3] / 255).toString());

            Material.Refresh(index_enemy);
            */
        } else {
            //Material.Destroy("Custom (Self)");
            //Material.Destroy("Custom (Enemy)");
            Material.Destroy("Local - Visible");
            Material.Destroy("Local - Attachments");
            Material.Destroy("Local - Desync");
            Material.Destroy("Local - Fakelag");
            Material.Destroy("Local - Arms");
            Material.Destroy("Local - Weapon");

            Material.Destroy("Enemy - Visible");
            Material.Destroy("Enemy - Hidden");
            Material.Destroy("Enemy - Attachments");
            Material.Destroy("Enemy - History");
        }
    },
    destroy_material: function () {
        Material.Destroy("Local - Visible");
        Material.Destroy("Local - Attachments");
        Material.Destroy("Local - Desync");
        Material.Destroy("Local - Fakelag");
        Material.Destroy("Local - Arms");
        Material.Destroy("Local - Weapon");

        Material.Destroy("Enemy - Visible");
        Material.Destroy("Enemy - Hidden");
        Material.Destroy("Enemy - Attachments");
        Material.Destroy("Enemy - History");
    },
    holopanel : function()
    {
        if( !UI.GetValue(UI_List.checkbox_holopanel) ) return;

        if (!Entity.IsAlive(ent_Local.id)) return;
        
        main_color = UI.GetColor(UI_List.colorpicker_border);

        title_color = UI.GetColor(UI_List.colorpicker_title);

        desync_title_color = UI.GetColor(UI_List.colorpicker_desync);
        desync_value_color = UI.GetColor(UI_List.colorpicker_desync_value);

        invert_title_color = UI.GetColor(UI_List.colorpicker_invert);
        invert_value_color = UI.GetColor(UI_List.colorpicker_invert_value);

        choke_title_color = UI.GetColor(UI_List.colorpicker_choke);
        choke_value_color = UI.GetColor(UI_List.colorpicker_choke_value);

        dt_title_color = UI.GetColor(UI_List.colorpicker_dt_title);
        dt_weapon_color = UI.GetColor(UI_List.colorpicker_dt_weapon);
        dt_bullet_color = UI.GetColor(UI_List.colorpicker_dt_bullet);

        hideshot_title_color = UI.GetColor(UI_List.colorpicker_hideshot);
        hideshot_value_color = UI.GetColor(UI_List.colorpicker_hideshot_value);

        bgcolor = [0, 0, 0, 150];

        x = UI.GetValue(UI_List.sliderX_holopanel);
        y = UI.GetValue(UI_List.sliderY_holopanel);

        main_alpha = main_color[3];

        glow_color = [ main_color[0], main_color[1], main_color[2], 30]

        maxdesync = Math.abs(Normalize(Local.GetRealYaw() - Local.GetFakeYaw()) / 2);

        var font = Render.GetFont("lexend.ttf", 10, true)
        var font2 = Render.GetFont("lexend.ttf", 12, true)
        var font3 = Render.GetFont("smallestpixel.ttf", 14, true)
        var fontbullet = Render.GetFont("bullet.ttf", 18, true);
        var fontweapon = Render.GetFont("undefeated.ttf", 18, true);

        Render.FilledRect( x, y, 225, 100, bgcolor); // bg panel

        Render.FilledRect( x , y, 225, 3, main_color); // Up
        Render.FilledRect( x, y, 3, 100, main_color); // Left
        Render.FilledRect( x, y + 97, 225, 3, main_color); // Bot
        Render.FilledRect( x + 223, y, 3, 100, main_color); // Right

        // outer border
        Render.FilledRect( x - 3, y - 5, 231, 5, glow_color); // Up
        Render.FilledRect( x - 5, y - 3, 5, 105, glow_color); // Left
        Render.FilledRect( x - 3, y + 100, 231, 5, glow_color); // Bot
        Render.FilledRect( x + 226, y - 3, 5, 105, glow_color); // Left



        
        Render.String( x + 10 , y + 10, 0, "ANTI-AIM DEBUG", title_color, font)

        Render.GradientRect( x + 10, y + 30, 2, 10, 0, bgcolor, desync_title_color);
        Render.GradientRect( x + 10, y + 40, 2, 10, 0, desync_title_color, bgcolor);

        Render.String(x + 20 , y + 33, 0, "DESYNC (", desync_title_color, font2)
        Render.String( x + 83 , y + 33, 0, maxdesync.toFixed(2), desync_value_color, font2)
        Render.String( x + Render.TextSize( maxdesync.toFixed(2), font2 )[0] + 88, y + 33, 0, ")", desync_title_color, font2)
        /*
        Render.String( x + 20 , y + 33, 0, "DESYNC (", desync_title_color, font2)
        Render.String( x + 19 , y + 32, 0, "DESYNC (", desync_title_color, font2)
        Render.String( x + 18 , y + 31, 0, "DESYNC (", desync_title_color, font2)
        Render.String( x + 17 , y + 30, 0, "DESYNC (", desync_title_color, font2)

        Render.String( x + 83 , y + 33, 0, maxdesync.toFixed(2), desync_value_color, font2)
        Render.String( x + 82 , y + 32, 0, maxdesync.toFixed(2), desync_value_color, font2)
        Render.String( x + 81 , y + 31, 0, maxdesync.toFixed(2), desync_value_color, font2)
        Render.String( x + 80 , y + 30, 0, maxdesync.toFixed(2), desync_value_color, font2)

        Render.String( x + 124 , y + 33, 0, ")", desync_title_color, font2)
        Render.String( x + 123 , y + 32, 0, ")", desync_title_color, font2)
        Render.String( x + 122 , y + 31, 0, ")", desync_title_color, font2)
        Render.String( x + 121 , y + 30, 0, ")", desync_title_color, font2)
        */

        //maxdesync.toFixed(2)
        //Render.ShadowString( x + 17 , y + 30, 0, "DESYNC ( " + maxdesync.toFixed(2) + " )", main_color, font2 )

        Render.String( x + 10 , y + 55, 0, "INVERTED-", invert_title_color, font)

        if(Keys.aa_invert)
        {
            Render.String( x + 68 , y + 55, 0, "TRUE", invert_value_color, font)
        }
        else
        {
            Render.String( x + 68 , y + 55, 0, "FALSE", invert_value_color, font)
        }

        text = "CHOKE :";
        var w = Render.TextSize(text, font)[0] + 8;
        const choke = Math.min(Globals.ChokedCommands(), 14);

        Render.String( x + 120 , y + 55, 0, "CHOKE : ", choke_title_color, font)

        Render.FilledRect(x + 169, y + 60, (choke * w / 14) - 2, 5, choke_value_color);

        wep_ClassName = Entity.GetClassName(ent_Local.weapon_id);
        var nextattack = Entity.GetProp(ent_Local.weapon_id, "CBaseCombatWeapon", "m_flNextPrimaryAttack");
        var CanShoot = false;
        if (nextattack <= Globals.Curtime()) {
            CanShoot = true;
        }

        
        Render.String( x + 10 , y + 75, 0, "DT : ", dt_title_color, font2)
        Render.String(x + 40, y + 75, 0, get_icon(ent_Local.weapon_name), dt_weapon_color, fontweapon);

        if ((wep_ClassName == "CKnife" || wep_ClassName == "CHEGrenade" || wep_ClassName == "CMolotovGrenade" || wep_ClassName == "CIncendiaryGrenade" || wep_ClassName == "CFlashbang" || wep_ClassName == "CSmokeGrenade" || wep_ClassName == "CDecoyGrenade" || wep_ClassName == "CWeaponTaser" || wep_ClassName == "CC4")) {
            //return
        } else if(wep_ClassName == "CWeaponSSG08" || wep_ClassName == "CWeaponAWP" || ent_Local.weapon_name == "r8 revolver"){
            if (CanShoot) {
                Render.String( x + Render.TextSize( get_icon(ent_Local.weapon_name), fontweapon )[0] + 40, y + 75, 0, "A", dt_bullet_color, fontbullet)
            } 
        }else {
            if (CanShoot) {
                Render.String( x + Render.TextSize( get_icon(ent_Local.weapon_name), fontweapon )[0] + 40, y + 75, 0, "A", dt_bullet_color, fontbullet)
            } 
            if (CanShoot && Exploit.GetCharge() == 1 && Keys.doubletap) {
                Render.String( x + Render.TextSize( get_icon(ent_Local.weapon_name), fontweapon )[0] + 50, y + 75, 0, "A", dt_bullet_color, fontbullet)
            } 
        }

        Render.String( x + 150 , y + 75, 0, "HS : ", hideshot_title_color, font2)

        Render.String( x + 180 , y + 75, 0, Keys.hideshot ? "ON" : "OFF", hideshot_value_color, font2)

        if (Input.IsKeyPressed(1) && UI.IsMenuOpen()) {
            const mouse_pos = Input.GetCursorPosition();
            if (InBounds(this.holopanel_X, this.holopanel_Y, 235, 110)) {
                UI.SetValue(["Visuals", "Visual Disaster", "Visual Disaster", "Holopanel-X"], mouse_pos[0] - 112.5);
                UI.SetValue(["Visuals", "Visual Disaster", "Visual Disaster", "Holopanel-Y"], mouse_pos[1] - 50);
            }
        }

    },
}


var lasttime = 0;
var clantag = false;

var dtTick = 0;
var log = "";

const Misc = {
    curtime: 0,
    temptime: 0,
    TimeNow: "",
    fps: 0,

    shots_fired: 0,
    hit: 0,
    miss: 0,
    target: 0,
    predicthc: 0,
    safety: 0,
    hitboxName: "",
    choked: 0,
    exploit: 0,
    last_update: 0,
    logged: false,

    console_filter : false,

    Update: function () {
        this.curtime = Globals.Curtime();

        const DateNow = new Date();
        this.TimeNow = DateNow.getHours().zeroPad() + ":" + DateNow.getMinutes().zeroPad() + ":" + DateNow.getSeconds().zeroPad();
        this.fps = Math.floor(1 / Global.Frametime());
        this.cur_ar = Convar.GetString("r_aspectratio");
    },
    dt_log: function () {
        log_choice = UI.GetValue(UI_List.multidrop_logtype);
        if (log_choice & 1 << 0) {
            var color = UI.GetColor(UI_List.colorpicker_dt);
            var e = Event.GetInt("exploit");

            if (Keys.doubletap) {
                if (e > 0) {
                    dtTick = Globals.Tickcount();

                } else if (dtTick != 0 && (Globals.Tickcount() - dtTick) < 16) {
                    log = "[ Disaster ] DT :  " + (Globals.Tickcount() - dtTick).toString() + " tick(s)\n";
                    Cheat.PrintColor(color, log);
                    tick = 0;
                }
            }
        }
    },
    hit_log: function () {
        log_choice = UI.GetValue(UI_List.multidrop_logtype);
        if (log_choice & 1 << 1) {
            var color = UI.GetColor(UI_List.colorpicker_hit);
            var hit = Entity.GetEntityFromUserID(Event.GetInt("userid"));
            var attacker = Entity.GetEntityFromUserID(Event.GetInt("attacker"));

            if (attacker == ent_Local.id && hit == this.target) {
                this.hit = this.hit + 1;
            } else {
                return;
            }

            var hittype = "Hit ";
            var hitbox = Event.GetInt('hitgroup');
            var target_damage = Event.GetInt("dmg_health");
            var target_health = Event.GetInt("health");
            var victim = Event.GetInt('userid');
            var attacker = Event.GetInt('attacker');
            var weapon = Event.GetString('weapon');
            var victimIndex = Entity.GetEntityFromUserID(victim);
            var attackerIndex = Entity.GetEntityFromUserID(attacker);
            var name = Entity.GetName(victimIndex);
            var simtime = Globals.Tickcount() % 17;

            var flags = "";

            if (this.exploit == 2) {
                flags += "DT|";
            }

            flags += "B";

            if (hitbox == 1) {
                flags += "H"
            }

            if (this.safety == 1) {
                this.safety == "true";
            } else {
                this.safety == "false";
            }

            if (weapon == "hegrenade")
                hittype = "Naded ";
            else if (weapon == "inferno")
                hittype = "Burned ";
            else if (weapon == "knife")
                hittype = "Knifed ";

            if (hittype == "Hit ") {
                if (UI.GetValue(UI_List.checkbox_logonchat)) {
                    Cheat.PrintChat(" \x08[\x0c Disaster \x08] " + hittype + name + "'s \x10" + HitgroupName(hitbox) + "\x08 By \x07" + target_damage.toString() + "\x08 (" + target_health.toString() + " remaining) , Hitbox = \x10" + HitgroupName(hitbox) + " \x08 (" + this.predicthc.toString() + "%) , Safety = \x03" + this.safety + "\x08 (\x10" + flags + "\x08) (\x10" + simtime + "\x08:\x10" + this.exploit + "\x08)\n");
                }
                Cheat.PrintColor(color, "[ Disaster ] " + hittype + name + "'s " + HitgroupName(hitbox) + " By " + target_damage.toString() + " (" + target_health.toString() + " remaining) , Hitbox = " + HitgroupName(hitbox) + " (" + this.predicthc.toString() + "%%) , Safety = " + this.safety + " (" + flags + ") (" + simtime + ":" + this.exploit + ")\n");
            }
        }
    },
    hurt_log: function () {
        log_choice = UI.GetValue(UI_List.multidrop_logtype);
        if (log_choice & 1 << 2) {
            var color = UI.GetColor(UI_List.colorpicker_hurt);
            var hit = Entity.GetEntityFromUserID(Event.GetInt("userid"));
            var attacker = Entity.GetEntityFromUserID(Event.GetInt("attacker"));
            var hitbox = Event.GetInt('hitgroup');

            if (hit == ent_Local.id) {
                if (UI.GetValue(UI_List.checkbox_logonchat)) {
                    Cheat.PrintChat(" \x08[\x0c Disaster \x08] Harmed By " + Entity.GetName(attacker) + " , Damage : " + Event.GetInt("dmg_health") + " , Hitbox : " + HitgroupName(hitbox) + "\n");
                }
                Cheat.PrintColor(color, "[ Disaster ] Harmed By " + Entity.GetName(attacker) + " , Damage : " + Event.GetInt("dmg_health") + " , Hitbox : " + HitgroupName(hitbox) + "\n");
            }
        }
    },
    clantag: function () {
        if (!World.GetServerString()) return;
        if (!UI.GetValue(UI_List.checkbox_clantag)) return;

        var time = parseInt((Globals.Curtime() * 2));

        if (time != lasttime) {
            if (UI.GetValue(UI_List.dropdown_clantag) == 0) {
                switch ((time) % 25) {
                    case 0: {
                        Local.SetClanTag(">");
                        break;
                    }
                    case 1: {
                        Local.SetClanTag(">>");
                        break;
                    }
                    case 2: {
                        Local.SetClanTag(">>>");
                        break;
                    }
                    case 3: {
                        Local.SetClanTag(">>>>");
                        break;
                    }
                    case 4: {
                        Local.SetClanTag(">>>>>");
                        break;
                    }
                    case 5: {
                        Local.SetClanTag(">>>>>>");
                        break;
                    }
                    case 6: {
                        Local.SetClanTag(">>>>>>>");
                        break;
                    }
                    case 7: {
                        Local.SetClanTag(">>>>>>>>");
                        break;
                    }
                    case 8: {
                        Local.SetClanTag(">>>>>>>D");
                        break;
                    }
                    case 9: {
                        Local.SetClanTag(">>>>>>Di");
                        break;
                    }
                    case 10: {
                        Local.SetClanTag(">>>>>Dis");
                        break;
                    }
                    case 11: {
                        Local.SetClanTag(">>>>Disa");
                        break;
                    }
                    case 12: {
                        Local.SetClanTag(">>>Disas");
                        break;
                    }
                    case 13: {
                        Local.SetClanTag(">>Disast");
                        break;
                    }
                    case 14: {
                        Local.SetClanTag(">Disaste");
                        break;
                    }
                    case 15: {
                        Local.SetClanTag("Disaster");
                        break;
                    }
                    case 16: {
                        Local.SetClanTag("Disaster");
                        break;
                    }
                    case 17: {
                        Local.SetClanTag("Disaste<");
                        break;
                    }
                    case 18: {
                        Local.SetClanTag("Disast<<");
                        break;
                    }
                    case 19: {
                        Local.SetClanTag("Disas<<<");
                        break;
                    }
                    case 20: {
                        Local.SetClanTag("Disa<<<<");
                        break;
                    }
                    case 21: {
                        Local.SetClanTag("Dis<<<<<");
                        break;
                    }
                    case 22: {
                        Local.SetClanTag("Di<<<<<<");
                        break;
                    }
                    case 23: {
                        Local.SetClanTag("D<<<<<<<");
                        break;
                    }
                    case 24: {
                        Local.SetClanTag("<<<<<<<<");
                        break;
                    }
                }
                clantag = true;
            }
        }
        lasttime = time;
    },
    aspect_ratio: function () {
        Convar.SetString("r_aspectratio", UI.GetValue(UI_List.slider_aspectratio).toString());
    },
    killsay: function () {
        var killsay_string = "";
        var targetName = Entity.GetName(Entity.GetEntityFromUserID(Event.GetInt("userid")));

        if (UI.GetValue(UI_List.dropdown_killsay) == 1) {
            killsay_string = "disaster.pages.dev";
        } else if (UI.GetValue(UI_List.dropdown_killsay) == 2) {
            killsay_string = "Welcome to the future disaster in hvh !";
        } else if (UI.GetValue(UI_List.dropdown_killsay) == 3) {
            killsay_string = "You die to " + this.fps + " FPS player ? How much is your fps ?";
        } else if (UI.GetValue(UI_List.dropdown_killsay) == 4) {
            killsay_string = "You die at " + this.TimeNow + ", congratulations !";
        } else if (UI.GetValue(UI_List.dropdown_killsay) == 5) {
            killsay_string = "Cmon bro, you die to the " + Event.GetString("weapon").toUpperCase() + ", haiya cannot la u";
        } else if (UI.GetValue(UI_List.dropdown_killsay) == 6) {
            killsay_string = "我可以操你妈吗？";
        }

        if (Entity.GetEntityFromUserID(Event.GetInt("attacker")) == ent_Local.id && UI.GetValue(UI_List.dropdown_killsay) != 0) {
            if (UI.GetValue(UI_List.checkbox_include_name)) {
                killsay_string = targetName + ", " + killsay_string;
            }
            Cheat.ExecuteCommand("say " + killsay_string);
        }
    },
    consoleFilter : function()
    {
        if (this.console_filter == false) {
            if(!UI.GetValue(UI_List.checkbox_consolefilter)) return;

            this.console_filter = true;

            Cheat.ExecuteCommand("clear")
            Convar.SetInt("developer", 0);
            Convar.SetInt("con_filter_enable", 1);
            Convar.SetString("con_filter_text", "IrWL5106TZZKNFPz4P4Gl3pSN?J370f5hi373ZjPg%VOVh6lN");
        }
        else
        {
            if(UI.GetValue(UI_List.checkbox_consolefilter)) return;

            this.console_filter = false;

            Convar.SetInt("developer", 0);
            Convar.SetInt("con_filter_enable", 0);
        }
    },
    legspam : function()
    {
        if(!UI.GetValue(UI_List.checkbox_legspam)) return;

        UI.SetValue(["Misc.", "Movement", "Movement", "Leg movement"], Globals.Tickcount() % 3 == 1 ? 1 : 2);
    }
}

const Callback = {
    onCreateMove: function () {
        ent_Local.Update();
        ent_Target.Update();

        Rage.overrideDT();
        Rage.fast_recharge();
        Rage.force_cond();
        Rage.defensiveDT();
        Rage.zeus_fl();
        Rage.overrideHC();
        Rage.force_hitbox_safety();
        Rage.noscope_modifier_hitchance();
        Rage.adaptive_hc();
        Rage.air_hc();
        Rage.target_hitchance();

        AA.Update();
        AA.preset_aa();
        AA.should_update();
        AA.update_freestanding();
        AA.update_settings();
        AA.low_delta();
        AA.legit_aa();
        AA.slowwalk();

        Visuals.draw_flags();
    },
    onDraw: function () {

        UI_List.UI_control();
        UI_List.advancecfg_control();
        Keys.Update();


        
        Rage.adaptiveAutostop();
        Rage.noscope_modifier_distance();


        AA.auto_dir();


        
        Visuals.Update();
        Visuals.render_flags();
        Visuals.Watermark();
        Visuals.Keybind();
        Visuals.getSpectator();
        Visuals.drawSpectator();
        Visuals.crosshair();
        Visuals.indicator();
        Visuals.holopanel();
        
        
        Misc.Update();
        Misc.clantag();
        Misc.consoleFilter();
        Misc.legspam();
        
    },
    onFrameStage: function () {
        Misc.aspect_ratio();
    },
    onRagebotFire: function () {

        AA.ideal_tick();

        Misc.dt_log();

        Misc.predicthc = Event.GetInt("hitchance");
        Misc.safety = Event.GetInt("safepoint");
        Misc.hitboxName = getHitboxName(Event.GetInt("hitbox"));
        Misc.exploit = Event.GetInt("exploit") + 1;
        Misc.target = Event.GetInt("target_index");
        Misc.shots_fired = Misc.shots_fired + 1;
        Misc.logged = false;
        Misc.last_update = Globals.Curtime();
    },
    onWeaponFire: function () {

    },
    onPlayerDeath: function () {
        Misc.killsay();
    },
    onPlayerHurt: function () {
        Visuals.thunder_strike();
        Misc.hit_log();
        Misc.hurt_log();
    },
    onMaterial: function () {
        Visuals.custom_chams();
    },
    onUnload: function () {
        Visuals.destroy_material();
    }
}

Cheat.RegisterCallback("CreateMove", "Callback.onCreateMove");
Cheat.RegisterCallback("Draw", "Callback.onDraw");
Cheat.RegisterCallback("FrameStageNotify", "Callback.onFrameStage");
Cheat.RegisterCallback("ragebot_fire", "Callback.onRagebotFire");
Cheat.RegisterCallback("weapon_fire", "Callback.onWeaponFire");
Cheat.RegisterCallback("player_death", "Callback.onPlayerDeath");
Cheat.RegisterCallback("player_hurt", "Callback.onPlayerHurt");
Cheat.RegisterCallback("Material", "Callback.onMaterial");
Cheat.RegisterCallback("Unload", "Callback.onUnload");