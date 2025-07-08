import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";
import {
  VibeSelectorWrapper,
  VibeLabel,
  VibeSelect,
} from "./styles";

const VibeSelector = ({ vibeStyle, setVibeStyle, colors }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <VibeSelectorWrapper>
      <VibeLabel colors={colors}>Vibe Style:</VibeLabel>
      <VibeSelect
        colors={colors}
        value={vibeStyle}
        onChange={(e) => setVibeStyle(e.target.value)}
      >
        <option value="american">American 🇺🇸</option>
        <option value="nigerian">Nigerian 🇳🇬</option>
        <option value="indian">Indian 🇮🇳</option>
        <option value="uk">UK 🇬🇧</option>
        <option value="uae">UAE 🇦🇪</option>
        <option value="canadian">Canadian 🇨🇦</option>
        <option value="southafrican">South African 🇿🇦</option>
        <option value="australian">Australian 🇦🇺</option>
        <option value="ghanaian">Ghanaian 🇬🇭</option>
        <option value="brazilian">Brazilian 🇧🇷</option>
      </VibeSelect>
    </VibeSelectorWrapper>
  );
};

export const getAddressVibe = (totalAmountTradedUSD, usdtEquivalent, vibeStyle) => {
  const traded = parseFloat(totalAmountTradedUSD.replace(/,/g, "")) || 0;
  const balance = parseFloat(usdtEquivalent.replace(/,/g, "")) || 0;

  const titles = {
    nigerian: [
      { title: "Azaman 🦁", balanceMin: 500000, tradedMin: 0, tradedMax: Infinity, tooltip: "Real blockchain royalty. Money na water. The street dey worship you and so does the blockchain!" },
      { title: "Odogwu 🔥", balanceMin: 100000, tradedMin: 0, tradedMax: Infinity, tooltip: "Odogwu with the Big trades. You're leading the pride, lion style. Blockcahin dey salama bossman!" },
      { title: "Big Fish 🐳", balanceMin: 10000, tradedMin: 0, tradedMax: Infinity, tooltip: "You dey swim for deep crypto waters! Solid trades making waves. Blockchain dey feel you big name!" },
      { title: "Oga Boss 💰", balanceMin: 5000, tradedMin: 0, tradedMax: Infinity, tooltip: "Oga at the top! Heavy trades shaking the blockchain. Big boss blockchain dey salama for you!" },
      { title: "Mazi 🌟", balanceMin: 100, tradedMin: 1001, tradedMax: Infinity, tooltip: "Mazi on the move! you self no small, pulling few heavy trades, blockcahin dey feel you senior man!" },
      { title: "Egbon 🕶️", balanceMin: 100, tradedMin: 251, tradedMax: 1000, tooltip: "Big brother of the chain! You dey pull steady trades, no shaking. The hustle go pay, keep rising!" },
      { title: "Smallie 😎", balanceMin: 100, tradedMin: 51, tradedMax: 250, tooltip: "Smallie with big dreams! You don start dey trade, but e get as e be. Hustle harder, blockchain dey wait!" },
      { title: "Ah! U Broke 😅", balanceMin: 0, balanceMax: 99, tradedMin: 0, tradedMax: 50, tooltip: "Omo, wetin dey? Low trades, empty wallet! Abeg, hustle o, make blockchain no laugh you!" },
    ],
    american: [
      { title: "Tycoon 💰", balanceMin: 500000, tradedMin: 0, tradedMax: Infinity, tooltip: "The ultimate crypto mogul! Stacking M’s on-chain, you’re the Wall Street of blockchain. Everyone’s chasing your alpha, OG!" },
      { title: "Whale Daddy 🐳", balanceMin: 100000, tradedMin: 0, tradedMax: Infinity, tooltip: "Big whale energy! Million-dollar trades, you’re flexing hard. Blockchain bows to your stacks, boss!" },
      { title: "Ballin’ 🏀", balanceMin: 10000, tradedMin: 0, tradedMax: Infinity, tooltip: "Livin’ large with big plays! Your wallet’s dunking on the chain, fast gains OG!" },
      { title: "Heavy Hitter ⚾", balanceMin: 5000, tradedMin: 0, tradedMax: Infinity, tooltip: "Swinging for the fences! Solid trades making noise on the blockchain. You’re a major player, fam!" },
      { title: "Shot Caller 🎯", balanceMin: 100, tradedMin: 1001, tradedMax: Infinity, tooltip: "Calling the shots with steady trades! You’re building that bag, one block at a time. Keep it 100!" },
      { title: "Hustler 😎", balanceMin: 100, tradedMin: 251, tradedMax: 1000, tooltip: "Grinding from the mud to the moon! Small trades, big hustle. Every satoshi counts, homie!" },
      { title: "Newbie 💪", balanceMin: 100, tradedMin: 51, tradedMax: 250, tooltip: "Yo, you just started! Tiny trades, but every whale was a guppy once. Stack those coins, rookie!" },
      { title: "Broke Boi 🥶", balanceMin: 0, balanceMax: 99, tradedMin: 0, tradedMax: 50, tooltip: "Ayo, wallet on E! Low trades, no stacks. Time to grind, brokie, or the blockchain’s gonna flex on you!" },
    ],
    ghanaian: [
      { title: "Crypto Obroni 💎", balanceMin: 500000, tradedMin: 0, tradedMax: Infinity, tooltip: "Eii, Obroni of the blockchain! Cedis and BTC dey flow like River Ankobra. You dey run the chain like true Accra big man!" },
      { title: "Kumasi Don 👑", balanceMin: 100000, tradedMin: 0, tradedMax: Infinity, tooltip: "Don of Oseikrom! Your trades heavy pass kelewele business. Blockchain dey bow for your Ashanti vibes!" },
      { title: "Accra Big Shot 🦒", balanceMin: 10000, tradedMin: 0, tradedMax: Infinity, tooltip: "Chale, you be the main guy for Accra! Big trades dey shake the chain like trotro for Circle. Blockchain dey hail you!" },
      { title: "Cedi Slay King 💸", balanceMin: 5000, tradedMin: 0, tradedMax: Infinity, tooltip: "You dey slay the crypto game! Solid trades wey dey make noise from Tema to Tamale. Keep chopping that blockchain money!" },
      { title: "Jollof Trader 🎉", balanceMin: 100, tradedMin: 1001, tradedMax: Infinity, tooltip: "Eii, you dey trade like Ghana jollof for party! Steady moves, blockchain dey taste your spicy hustle!" },
      { title: "Hustle Borla 😤", balanceMin: 100, tradedMin: 251, tradedMax: 1000, tooltip: "Chale, you dey hustle small small but e go pay! Keep pushing those trades, blockchain go soon call you boss!" },
      { title: "Smallie 😎", balanceMin: 100, tradedMin: 51, tradedMax: 250, tooltip: "Small chops, big dreams! You dey start the crypto journey. Push harder, Ghana blockchain dey watch you!" },
      { title: "Broke Chale 😭", balanceMin: 0, balanceMax: 99, tradedMin: 0, tradedMax: 50, tooltip: "Ei, chale your wallet dry pass Sahara! No trades, no coins. Abeg, rise up, make blockchain no yab you!" },
    ],
    southafrican: [
      { title: "Crypto Mkhulu 💰", balanceMin: 500000, tradedMin: 0, tradedMax: Infinity, tooltip: "Yoh, you’re the granddaddy of crypto! Rands and BTC piling high like Table Mountain. Blockchain bows to your Mzansi might!" },
      { title: "Gauteng G.O.A.T 🦒", balanceMin: 100000, tradedMin: 0, tradedMax: Infinity, tooltip: "Eish, you’re the Greatest Of All Time in Gauteng! Big trades shaking the chain like a Jozi jol. Blockchain hails you!" },
      { title: "Cape Town Capo 🌊", balanceMin: 10000, tradedMin: 0, tradedMax: Infinity, tooltip: "Now now, you’re running the chain like a Camps Bay boss! Solid trades got the blockchain feeling your coastal vibes!" },
      { title: "Rand Ruler 💸", balanceMin: 5000, tradedMin: 0, tradedMax: Infinity, tooltip: "Lekker, bru! You’re ruling the rands with heavy trades. From Durban to Soweto, blockchain knows your name!" },
      { title: "Bunny Chow Baron 🍲", balanceMin: 100, tradedMin: 1001, tradedMax: Infinity, tooltip: "Aweh, you’re trading spicy like bunny chow! Steady moves making Mzansi proud on the blockchain!" },
      { title: "Tshisa Hustler 🔥", balanceMin: 100, tradedMin: 251, tradedMax: 1000, tooltip: "Yoh, you’re bringing the heat, skhokho! Small trades, but your hustle’s loud. Blockchain go call you boss soon!" },
      { title: "Kasi Starter ⚡", balanceMin: 100, tradedMin: 51, tradedMax: 250, tooltip: "Eina, you just dey start! Tiny trades, but Mzansi kasi vibes strong. Push harder, the chain’s watching!" },
      { title: "Skint Skelm 😅", balanceMin: 0, balanceMax: 99, tradedMin: 0, tradedMax: 50, tooltip: "Auw, bru, wallet dry pass Kalahari! No trades, no coins. Abeg, hustle quick before blockchain yabs you!" },
    ],
    uae: [
      { title: "Crypto Sultan 🕌", balanceMin: 500000, tradedMin: 0, tradedMax: Infinity, tooltip: "Wallah, you’re the king of crypto! Dirhams and BTC stack high like Burj Al Arab. Blockchain hails your majesty!" },
      { title: "Dubai Don 💰", balanceMin: 100000, tradedMin: 0, tradedMax: Infinity, tooltip: "Masha Allah, you’re ruling the chain! Big trades flash brighter than a Sheikh Zayed Road supercar!" },
      { title: "Souk Star 🌟", balanceMin: 10000, tradedMin: 0, tradedMax: Infinity, tooltip: "Habibi, your trades shine like gold in Al Ain! Heavy moves got the blockchain buzzing, yalla!" },
      { title: "Desert Dealer 🦅", balanceMin: 5000, tradedMin: 0, tradedMax: Infinity, tooltip: "Soaring with solid trades like a falcon! Your wallet’s hunting wins across the UAE blockchain!" },
      { title: "Majlis Mogul 🐪", balanceMin: 100, tradedMin: 1001, tradedMax: Infinity, tooltip: "Insha Allah, you’re chilling like a boss in the majlis! Steady trades paving your way up the chain!" },
      { title: "Bazaar Bloke 🛍️", balanceMin: 100, tradedMin: 251, tradedMax: 1000, tooltip: "Small trades, big hustle! You’re wheeling and dealing in the blockchain souk, UAE style!" },
      { title: "Dune Dabbler 😎", balanceMin: 100, tradedMin: 51, tradedMax: 250, tooltip: "Yalla, just starting out? Tiny trades, but every dirham’s a step. Keep trekking, the chain’s watching!" },
      { title: "Broke Bedouin 😅", balanceMin: 0, balanceMax: 99, tradedMin: 0, tradedMax: 50, tooltip: "Aiyee, wallet dry like Rub’ al Khali! No trades, no dirhams. Hustle fast or blockchain will laugh at you!" },
    ],
    indian: [
      { title: "Crypto Maharaja 👑", balanceMin: 500000, tradedMin: 0, tradedMax: Infinity, tooltip: "Arre wah, you’re the blockchain ka Maharaja! Rupees and BTC flowing like Ganga. Chain bows to your josh!" },
      { title: "Mumbai Mogul 💸", balanceMin: 100000, tradedMin: 0, tradedMax: Infinity, tooltip: "Bhai, big trades ruling from Maximum City! Your wallet’s got more masala than a Bollywood blockbuster!" },
      { title: "Dilli Don 🦁", balanceMin: 10000, tradedMin: 0, tradedMax: Infinity, tooltip: "Oye, you’re trading like a Dilli ka sher! Heavy moves shaking the blockchain, full josh!" },
      { title: "Bangalore Boss 💻", balanceMin: 5000, tradedMin: 0, tradedMax: Infinity, tooltip: "Code and crypto, you’re killing it! Solid trades, you’re the Silicon Valley of India’s blockchain!" },
      { title: "Chai Trader ☕", balanceMin: 100, tradedMin: 1001, tradedMax: Infinity, tooltip: "Arre, steady trades with chai on the side! You’re brewing success on the blockchain, bhai!" },
      { title: "Bazaar Star 🌟", balanceMin: 100, tradedMin: 251, tradedMax: 1000, tooltip: "Chhota trades, bada dream! You’re hustling like a Chor Bazaar pro. Keep climbing, yaar!" },
      { title: "Naya Newbie 😎", balanceMin: 100, tradedMin: 51, tradedMax: 250, tooltip: "Abhi shuru kiya, na? Tiny trades, but every paisa counts. Hustle hard, blockchain’s waiting!" },
      { title: "Pocket Khali 😅", balanceMin: 0, balanceMax: 99, tradedMin: 0, tradedMax: 50, tooltip: "Oof, bhai, wallet khali? No trades, no paisa! Jaldi hustle, warna blockchain tera mazak udayega!" },
    ],
    uk: [
      { title: "Blockchain Baron 🏰", balanceMin: 500000, tradedMin: 0, tradedMax: Infinity, tooltip: "Blimey, you’re the crypto nobility! Pounds and BTC stacking taller than the Shard. The blockchain’s your manor, guv!" },
      { title: "London Lord 💷", balanceMin: 100000, tradedMin: 0, tradedMax: Infinity, tooltip: "Oi, you’re ruling the chain from the Square Mile! Big trades got the blockchain bowing like it’s Buckingham Palace!" },
      { title: "Footie Tycoon ⚽", balanceMin: 10000, tradedMin: 0, tradedMax: Infinity, tooltip: "Proper geezer scoring crypto goals! Your trades hit hard like a striker at Old Trafford. Blockchain’s buzzing, mate!" },
      { title: "Quid King 💸", balanceMin: 5000, tradedMin: 0, tradedMax: Infinity, tooltip: "You’re cashing in quids like a boss! Solid trades from Brixton to Bristol, blockchain’s feeling your UK hustle!" },
      { title: "Banger Boss 🍴", balanceMin: 100, tradedMin: 1001, tradedMax: Infinity, tooltip: "Trading tasty like bangers and mash! Steady moves making the blockchain proper chuffed, lad!" },
      { title: "Pint Punter 🍺", balanceMin: 100, tradedMin: 251, tradedMax: 1000, tooltip: "Small trades, big graft! You’re punting on the chain like it’s last orders at the pub. Keep at it, mate!" },
      { title: "Cheeky Newbie 😎", balanceMin: 100, tradedMin: 51, tradedMax: 250, tooltip: "Just kicking off, yeah? Tiny trades, but you got that British grit. Get stuck in, the blockchain’s waiting!" },
      { title: "Skint Scally 😅", balanceMin: 0, balanceMax: 99, tradedMin: 0, tradedMax: 50, tooltip: "Cor, mate, your wallet’s emptier than a tube at midnight! No trades, no dosh. Hustle quick or blockchain’ll take the piss!" },
    ],
    canadian: [
      { title: "Crypto Canuck 🍁", balanceMin: 500000, tradedMin: 0, tradedMax: Infinity, tooltip: "Eh, you’re the top dog on the blockchain! Loonies and BTC piling high like Banff peaks. The chain’s your igloo, bud!" },
      { title: "Hockey Honcho 🥅", balanceMin: 100000, tradedMin: 0, tradedMax: Infinity, tooltip: "Holy moly, you’re slapshotting big trades! From T.O. to Calgary, the blockchain’s cheering your Canuck hustle!" },
      { title: "Maple Mogul 💰", balanceMin: 10000, tradedMin: 0, tradedMax: Infinity, tooltip: "Beauty, eh! Your trades are sweeter than maple syrup, shaking the chain like a Moose Jaw storm!" },
      { title: "Gravy Grinder 🍟", balanceMin: 5000, tradedMin: 0, tradedMax: Infinity, tooltip: "Solid trades with that poutine drip! You’re making waves from Montreal to Victoria on the blockchain, hoser!" },
      { title: "Double-Double Dealer ☕", balanceMin: 100, tradedMin: 1001, tradedMax: Infinity, tooltip: "Steady trading like a Tim Hortons run! Your moves got the blockchain buzzing, eh, you beauty!" },
      { title: "Rink Rat 🏒", balanceMin: 100, tradedMin: 251, tradedMax: 1000, tooltip: "Small trades, big dreams! You’re skating up the chain like a shinny pro. Keep grinding, bud!" },
      { title: "Toonie Trier 😎", balanceMin: 100, tradedMin: 51, tradedMax: 250, tooltip: "Just starting, eh? Tiny trades, but you got that Canuck grit. Hustle hard, the blockchain’s watching!" },
      { title: "Skint Skater 😅", balanceMin: 0, balanceMax: 99, tradedMin: 0, tradedMax: 50, tooltip: "Aw geez, your wallet’s emptier than a frozen lake! No trades, no loonies. Get moving or the blockchain’ll chirp ya!" },
    ],
    australian: [
      { title: "Crypto Croco 🐊", balanceMin: 500000, tradedMin: 0, tradedMax: Infinity, tooltip: "Strewth, you’re a blockchain beast! Dollas and BTC piling like Uluru. The chain’s your outback, mate!" },
      { title: "Bondi Baron 🏄", balanceMin: 100000, tradedMin: 0, tradedMax: Infinity, tooltip: "Fair dinkum, big trades from the beach! Your wallet’s riding waves bigger than Sydney’s surf!" },
      { title: "Bushranger Boss 🔥", balanceMin: 10000, tradedMin: 0, tradedMax: Infinity, tooltip: "Crikey, you’re robbing the chain blind! Heavy trades making the blockchain sing, Aussie style!" },
      { title: "Barbie King 🍖", balanceMin: 5000, tradedMin: 0, tradedMax: Infinity, tooltip: "Chuck another trade on the barbie! Solid moves, you’re grilling the blockchain like a true blue!" },
      { title: "Outback Operator 🦘", balanceMin: 100, tradedMin: 1001, tradedMax: Infinity, tooltip: "Bonza trades, mate! You’re hopping up the chain with steady wins, straight from the bush!" },
      { title: "Grommet Grinder 🌊", balanceMin: 100, tradedMin: 251, tradedMax: 1000, tooltip: "Small trades, but you’re no drongo! Hustling hard, you’ll surf the blockchain soon!" },
      { title: "Battler Bloke 😎", balanceMin: 100, tradedMin: 51, tradedMax: 250, tooltip: "Starting small, eh? Tiny trades, but every cent’s a ripper. Keep at it, you’ll be a legend!" },
      { title: "Broke Bogan 😫", balanceMin: 0, balanceMax: 99, tradedMin: 0, tradedMax: 50, tooltip: "Oi, mate, wallet’s flatter than a roadkill roo! No trades, no dollas. Get cracking or blockchain’ll have a go at ya!" },
    ],
    brazilian: [
      { title: "Rei do Real 👑", balanceMin: 500000, tradedMin: 0, tradedMax: Infinity, tooltip: "Meu Deus, you’re the crypto king! Reais and BTC samba like Carnival. Blockchain’s your favela, patrão!" },
      { title: "Carioca Czar 💃", balanceMin: 100000, tradedMin: 0, tradedMax: Infinity, tooltip: "Caramba, big trades from Rio! Your wallet’s dancing harder than Copacabana’s nightlife!" },
      { title: "Samba Star 🌟", balanceMin: 10000, tradedMin: 0, tradedMax: Infinity, tooltip: "Valeu, you’re trading with samba swagger! Heavy moves shaking the blockchain, Brazilian style!" },
      { title: "Caipirinha Capo 🍹", balanceMin: 5000, tradedMin: 0, tradedMax: Infinity, tooltip: "Saúde, solid trades flowing smooth! You’re mixing crypto like a caipirinha on the chain!" },
      { title: "Favela Fighter ⚽", balanceMin: 100, tradedMin: 1001, tradedMax: Infinity, tooltip: "Tô de boa with steady trades! You’re kicking goals on the blockchain, straight from the streets!" },
      { title: "Mano Mover 😎", balanceMin: 100, tradedMin: 251, tradedMax: 1000, tooltip: "Pequeno but powerful trades! You’re hustling like a São Paulo street vendor, mano!" },
      { title: "Novato 😄", balanceMin: 100, tradedMin: 51, tradedMax: 250, tooltip: "Começando agora, né? Tiny trades, but every real counts. Vai com tudo, blockchain’s waiting!" },
      { title: "Sem Grana 😢", balanceMin: 0, balanceMax: 99, tradedMin: 0, tradedMax: 50, tooltip: "Poxa, mano, carteira vazia? No trades, no reais! Corre atrás, senão blockchain vai zoar você!" },
    ],
  };

  const selectedTitles = titles[vibeStyle] || titles.nigerian;

  // Prioritize balance first, then traded amount
  for (const { title, balanceMin, balanceMax, tradedMin, tradedMax, tooltip } of selectedTitles) {
    const balanceMatches = balanceMax ? balance >= balanceMin && balance <= balanceMax : balance >= balanceMin;
    if (balanceMatches && traded >= tradedMin && traded <= tradedMax) {
      return { title, tooltip };
    }
  }

  // Fallback for no match
  return selectedTitles[selectedTitles.length - 1];
};

export const isBrokeStatus = (vibeTitle) => {
  const brokeTitles = [
    "Ah! U Broke 😅",
    "Broke Boi 🥶",
    "Broke Chale 😭",
    "Skint Skelm 😅",
    "Broke Bedouin 😅",
    "Pocket Khali 😅",
    "Skint Scally 😅",
    "Skint Skater 😅",
    "Broke Bogan 😫",
    "Sem Grana 😢",
  ];
  return brokeTitles.includes(vibeTitle);
};

export default VibeSelector;
