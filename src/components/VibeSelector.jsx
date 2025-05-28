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
      { title: "Azaman 🦁", tradedMin: 1000001, tradedMax: Infinity, balance: 0, tooltip: "Real blockchain royalty. Money na water. The street dey worship you and so does the blockchain!"},
      { title: "Odogwu 🔥", tradedMin: 100001, tradedMax: 1000000, balance: 0, tooltip: "Odogwu with the Big trades. You're leading the pride, lion style. Blockcahin dey salama bossman!" },
      { title: "Big Fish 🐳", tradedMin: 10001, tradedMax: 100000, balance: 0, tooltip: "You dey swim for deep crypto waters! Solid trades making waves. Blockchain dey feel you big name!" },
      { title: "Oga Boss 💰", tradedMin: 5001, tradedMax: 10000, balance: 0, tooltip: "Oga at the top! Heavy trades shaking the blockchain. Big boss blockchain dey salama for you!" },
      { title: "Mazi 🌟", tradedMin: 1001, tradedMax: 5000, balance: 0, tooltip: "Mazi on the move! you self no small, pulling few heavy trades, blockcahin dey feel you senior man!" },
      { title: "Egbon 🕶️", tradedMin: 251, tradedMax: 1000, balance: 0, tooltip: "Big brother of the chain! You dey pull steady trades, no shaking. The hustle go pay, keep rising!" },
      { title: "Smallie 😎", tradedMin: 51, tradedMax: 250, balance: 0, tooltip: "Smallie with big dreams! You don start dey trade, but e get as e be. Hustle harder, blockchain dey wait!" },
      { title: "Ah! U Broke 😅", tradedMin: 0, tradedMax: 50, balance: 0, tooltip: "Omo, wetin dey? Low trades, empty wallet! Abeg, hustle o, make blockchain no laugh you!" },
    ],
    american: [
      { title: "Tycoon 💰", tradedMin: 1000001, tradedMax: Infinity, balance: 0, tooltip: "The ultimate crypto mogul! Stacking M’s on-chain, you’re the Wall Street of blockchain. Everyone’s chasing your alpha, OG!" },
      { title: "Whale Daddy 🐳", tradedMin: 100001, tradedMax: 1000000, balance: 0, tooltip: "Big whale energy! Million-dollar trades, you’re flexing hard. Blockchain bows to your stacks, boss!" },
      { title: "Ballin’ 🏀", tradedMin: 10001, tradedMax: 100000, balance: 0, tooltip: "Livin’ large with big plays! Your wallet’s dunking on the chain, fast gains OG!" },
      { title: "Heavy Hitter ⚾", tradedMin: 5001, tradedMax: 10000, balance: 0, tooltip: "Swinging for the fences! Solid trades making noise on the blockchain. You’re a major player, fam!" },
      { title: "Shot Caller 🎯", tradedMin: 1001, tradedMax: 5000, balance: 0, tooltip: "Calling the shots with steady trades! You’re building that bag, one block at a time. Keep it 100!" },
      { title: "Hustler 😎", tradedMin: 251, tradedMax: 1000, balance: 0, tooltip: "Grinding from the mud to the moon! Small trades, big hustle. Every satoshi counts, homie!" },
      { title: "Newbie 💪", tradedMin: 51, tradedMax: 250, balance: 0, tooltip: "Yo, you just started! Tiny trades, but every whale was a guppy once. Stack those coins, rookie!" },
      { title: "Broke Boi 🥶", tradedMin: 0, tradedMax: 50, balance: 0, tooltip: "Ayo, wallet on E! Low trades, no stacks. Time to grind, brokie, or the blockchain’s gonna flex on you!" },
    ],
   ghanaian: [
      { title: "Crypto Obroni 💎", tradedMin: 1000001, tradedMax: Infinity, balance: 0, tooltip: "Eii, Obroni of the blockchain! Cedis and BTC dey flow like River Ankobra. You dey run the chain like true Accra big man!" },
      { title: "Kumasi Don 👑", tradedMin: 100001, tradedMax: 1000000, balance: 0, tooltip: "Don of Oseikrom! Your trades heavy pass kelewele business. Blockchain dey bow for your Ashanti vibes!" },
      { title: "Accra Big Shot 🦒", tradedMin: 10001, tradedMax: 100000, balance: 0, tooltip: "Chale, you be the main guy for Accra! Big trades dey shake the chain like trotro for Circle. Blockchain dey hail you!" },
      { title: "Cedi Slay King 💸", tradedMin: 5001, tradedMax: 10000, balance: 0, tooltip: "You dey slay the crypto game! Solid trades wey dey make noise from Tema to Tamale. Keep chopping that blockchain money!" },
      { title: "Jollof Trader 🎉", tradedMin: 1001, tradedMax: 5000, balance: 0, tooltip: "Eii, you dey trade like Ghana jollof for party! Steady moves, blockchain dey taste your spicy hustle!" },
      { title: "Hustle Borla 😤", tradedMin: 251, tradedMax: 1000, balance: 0, tooltip: "Chale, you dey hustle small small but e go pay! Keep pushing those trades, blockchain go soon call you boss!" },
      { title: "Smallie 😎", tradedMin: 51, tradedMax: 250, balance: 0, tooltip: "Small chops, big dreams! You dey start the crypto journey. Push harder, Ghana blockchain dey watch you!" },
      { title: "Broke Chale 😭", tradedMin: 0, tradedMax: 50, balance: 0, tooltip: "Ei, chale your wallet dry pass Sahara! No trades, no coins. Abeg, rise up, make blockchain no yab you!" },
    ],
   southafrican: [
      { title: "Crypto Mkhulu 💰", tradedMin: 1000001, tradedMax: Infinity, balance: 0, tooltip: "Yoh, you’re the granddaddy of crypto! Rands and BTC piling high like Table Mountain. Blockchain bows to your Mzansi might!" },
      { title: "Gauteng G.O.A.T 🦒", tradedMin: 100001, tradedMax: 1000000, balance: 0, tooltip: "Eish, you’re the Greatest Of All Time in Gauteng! Big trades shaking the chain like a Jozi jol. Blockchain hails you!" },
      { title: "Cape Town Capo 🌊", tradedMin: 10001, tradedMax: 100000, balance: 0, tooltip: "Now now, you’re running the chain like a Camps Bay boss! Solid trades got the blockchain feeling your coastal vibes!" },
      { title: "Rand Ruler 💸", tradedMin: 5001, tradedMax: 10000, balance: 0, tooltip: "Lekker, bru! You’re ruling the rands with heavy trades. From Durban to Soweto, blockchain knows your name!" },
      { title: "Bunny Chow Baron 🍲", tradedMin: 1001, tradedMax: 5000, balance: 0, tooltip: "Aweh, you’re trading spicy like bunny chow! Steady moves making Mzansi proud on the blockchain!" },
      { title: "Tshisa Hustler 🔥", tradedMin: 251, tradedMax: 1000, balance: 0, tooltip: "Yoh, you’re bringing the heat, skhokho! Small trades, but your hustle’s loud. Blockchain go call you boss soon!" },
      { title: "Kasi Starter ⚡", tradedMin: 51, tradedMax: 250, balance: 0, tooltip: "Eina, you just dey start! Tiny trades, but Mzansi kasi vibes strong. Push harder, the chain’s watching!" },
      { title: "Skint Skelm 😅", tradedMin: 0, tradedMax: 50, balance: 0, tooltip: "Auw, bru, wallet dry pass Kalahari! No trades, no coins. Abeg, hustle quick before blockchain yabs you!" },
    ],
    uae: [
      { title: "Crypto Sultan 🕌", tradedMin: 1000001, tradedMax: Infinity, balance: 0, tooltip: "Wallah, you’re the king of crypto! Dirhams and BTC stack high like Burj Al Arab. Blockchain hails your majesty!" },
      { title: "Dubai Don 💰", tradedMin: 100001, tradedMax: 1000000, balance: 0, tooltip: "Masha Allah, you’re ruling the chain! Big trades flash brighter than a Sheikh Zayed Road supercar!" },
      { title: "Souk Star 🌟", tradedMin: 10001, tradedMax: 100000, balance: 0, tooltip: "Habibi, your trades shine like gold in Al Ain! Heavy moves got the blockchain buzzing, yalla!" },
      { title: "Desert Dealer 🦅", tradedMin: 5001, tradedMax: 10000, balance: 0, tooltip: "Soaring with solid trades like a falcon! Your wallet’s hunting wins across the UAE blockchain!" },
      { title: "Majlis Mogul 🐪", tradedMin: 1001, tradedMax: 5000, balance: 0, tooltip: "Insha Allah, you’re chilling like a boss in the majlis! Steady trades paving your way up the chain!" },
      { title: "Bazaar Bloke 🛍️", tradedMin: 251, tradedMax: 1000, balance: 0, tooltip: "Small trades, big hustle! You’re wheeling and dealing in the blockchain souk, UAE style!" },
      { title: "Dune Dabbler 😎", tradedMin: 51, tradedMax: 250, balance: 0, tooltip: "Yalla, just starting out? Tiny trades, but every dirham’s a step. Keep trekking, the chain’s watching!" },
      { title: "Broke Bedouin 😅", tradedMin: 0, tradedMax: 50, balance: 0, tooltip: "Aiyee, wallet dry like Rub’ al Khali! No trades, no dirhams. Hustle fast or blockchain will laugh at you!" },
    ],
    indian: [
      { title: "Crypto Maharaja 👑", tradedMin: 1000001, tradedMax: Infinity, balance: 0, tooltip: "Arre wah, you’re the blockchain ka Maharaja! Rupees and BTC flowing like Ganga. Chain bows to your josh!" },
      { title: "Mumbai Mogul 💸", tradedMin: 100001, tradedMax: 1000000, balance: 0, tooltip: "Bhai, big trades ruling from Maximum City! Your wallet’s got more masala than a Bollywood blockbuster!" },
      { title: "Dilli Don 🦁", tradedMin: 10001, tradedMax: 100000, balance: 0, tooltip: "Oye, you’re trading like a Dilli ka sher! Heavy moves shaking the blockchain, full josh!" },
      { title: "Bangalore Boss 💻", tradedMin: 5001, tradedMax: 10000, balance: 0, tooltip: "Code and crypto, you’re killing it! Solid trades, you’re the Silicon Valley of India’s blockchain!" },
      { title: "Chai Trader ☕", tradedMin: 1001, tradedMax: 5000, balance: 0, tooltip: "Arre, steady trades with chai on the side! You’re brewing success on the blockchain, bhai!" },
      { title: "Bazaar Star 🌟", tradedMin: 251, tradedMax: 1000, balance: 0, tooltip: "Chhota trades, bada dream! You’re hustling like a Chor Bazaar pro. Keep climbing, yaar!" },
      { title: "Naya Newbie 😎", tradedMin: 51, tradedMax: 250, balance: 0, tooltip: "Abhi shuru kiya, na? Tiny trades, but every paisa counts. Hustle hard, blockchain’s waiting!" },
      { title: "Pocket Khali 😅", tradedMin: 0, tradedMax: 50, balance: 0, tooltip: "Oof, bhai, wallet khali? No trades, no paisa! Jaldi hustle, warna blockchain tera mazak udayega!" },
    ],
    uk: [
      { title: "Blockchain Baron 🏰", tradedMin: 1000001, tradedMax: Infinity, balance: 0, tooltip: "Blimey, you’re the crypto nobility! Pounds and BTC stacking taller than the Shard. The blockchain’s your manor, guv!" },
      { title: "London Lord 💷", tradedMin: 100001, tradedMax: 1000000, balance: 0, tooltip: "Oi, you’re ruling the chain from the Square Mile! Big trades got the blockchain bowing like it’s Buckingham Palace!" },
      { title: "Footie Tycoon ⚽", tradedMin: 10001, tradedMax: 100000, balance: 0, tooltip: "Proper geezer scoring crypto goals! Your trades hit hard like a striker at Old Trafford. Blockchain’s buzzing, mate!" },
      { title: "Quid King 💸", tradedMin: 5001, tradedMax: 10000, balance: 0, tooltip: "You’re cashing in quids like a boss! Solid trades from Brixton to Bristol, blockchain’s feeling your UK hustle!" },
      { title: "Banger Boss 🍴", tradedMin: 1001, tradedMax: 5000, balance: 0, tooltip: "Trading tasty like bangers and mash! Steady moves making the blockchain proper chuffed, lad!" },
      { title: "Pint Punter 🍺", tradedMin: 251, tradedMax: 1000, balance: 0, tooltip: "Small trades, big graft! You’re punting on the chain like it’s last orders at the pub. Keep at it, mate!" },
      { title: "Cheeky Newbie 😎", tradedMin: 51, tradedMax: 250, balance: 0, tooltip: "Just kicking off, yeah? Tiny trades, but you got that British grit. Get stuck in, the blockchain’s waiting!" },
      { title: "Skint Scally 😅", tradedMin: 0, tradedMax: 50, balance: 0, tooltip: "Cor, mate, your wallet’s emptier than a tube at midnight! No trades, no dosh. Hustle quick or blockchain’ll take the piss!" },
    ],
   canadian: [
      { title: "Crypto Canuck 🍁", tradedMin: 1000001, tradedMax: Infinity, balance: 0, tooltip: "Eh, you’re the top dog on the blockchain! Loonies and BTC piling high like Banff peaks. The chain’s your igloo, bud!" },
      { title: "Hockey Honcho 🥅", tradedMin: 100001, tradedMax: 1000000, balance: 0, tooltip: "Holy moly, you’re slapshotting big trades! From T.O. to Calgary, the blockchain’s cheering your Canuck hustle!" },
      { title: "Maple Mogul 💰", tradedMin: 10001, tradedMax: 100000, balance: 0, tooltip: "Beauty, eh! Your trades are sweeter than maple syrup, shaking the chain like a Moose Jaw storm!" },
      { title: "Gravy Grinder 🍟", tradedMin: 5001, tradedMax: 10000, balance: 0, tooltip: "Solid trades with that poutine drip! You’re making waves from Montreal to Victoria on the blockchain, hoser!" },
      { title: "Double-Double Dealer ☕", tradedMin: 1001, tradedMax: 5000, balance: 0, tooltip: "Steady trading like a Tim Hortons run! Your moves got the blockchain buzzing, eh, you beauty!" },
      { title: "Rink Rat 🏒", tradedMin: 251, tradedMax: 1000, balance: 0, tooltip: "Small trades, big dreams! You’re skating up the chain like a shinny pro. Keep grinding, bud!" },
      { title: "Toonie Trier 😎", tradedMin: 51, tradedMax: 250, balance: 0, tooltip: "Just starting, eh? Tiny trades, but you got that Canuck grit. Hustle hard, the blockchain’s watching!" },
      { title: "Skint Skater 😅", tradedMin: 0, tradedMax: 50, balance: 0, tooltip: "Aw geez, your wallet’s emptier than a frozen lake! No trades, no loonies. Get moving or the blockchain’ll chirp ya!" },
    ],
    australian: [
      { title: "Crypto Croco 🐊", tradedMin: 1000001, tradedMax: Infinity, balance: 0, tooltip: "Strewth, you’re a blockchain beast! Dollas and BTC piling like Uluru. The chain’s your outback, mate!" },
      { title: "Bondi Baron 🏄", tradedMin: 100001, tradedMax: 1000000, balance: 0, tooltip: "Fair dinkum, big trades from the beach! Your wallet’s riding waves bigger than Sydney’s surf!" },
      { title: "Bushranger Boss 🔥", tradedMin: 10001, tradedMax: 100000, balance: 0, tooltip: "Crikey, you’re robbing the chain blind! Heavy trades making the blockchain sing, Aussie style!" },
      { title: "Barbie King 🍖", tradedMin: 5001, tradedMax: 10000, balance: 0, tooltip: "Chuck another trade on the barbie! Solid moves, you’re grilling the blockchain like a true blue!" },
      { title: "Outback Operator 🦘", tradedMin: 1001, tradedMax: 5000, balance: 0, tooltip: "Bonza trades, mate! You’re hopping up the chain with steady wins, straight from the bush!" },
      { title: "Grommet Grinder 🌊", tradedMin: 251, tradedMax: 1000, balance: 0, tooltip: "Small trades, but you’re no drongo! Hustling hard, you’ll surf the blockchain soon!" },
      { title: "Battler Bloke 😎", tradedMin: 51, tradedMax: 250, balance: 0, tooltip: "Starting small, eh? Tiny trades, but every cent’s a ripper. Keep at it, you’ll be a legend!" },
      { title: "Broke Bogan 😫", tradedMin: 0, tradedMax: 50, balance: 0, tooltip: "Oi, mate, wallet’s flatter than a roadkill roo! No trades, no dollas. Get cracking or blockchain’ll have a go at ya!" },
    ],
    brazilian: [
      { title: "Rei do Real 👑", tradedMin: 1000001, tradedMax: Infinity, balance: 0, tooltip: "Meu Deus, you’re the crypto king! Reais and BTC samba like Carnival. Blockchain’s your favela, patrão!" },
      { title: "Carioca Czar 💃", tradedMin: 100001, tradedMax: 1000000, balance: 0, tooltip: "Caramba, big trades from Rio! Your wallet’s dancing harder than Copacabana’s nightlife!" },
      { title: "Samba Star 🌟", tradedMin: 10001, tradedMax: 100000, balance: 0, tooltip: "Valeu, you’re trading with samba swagger! Heavy moves shaking the blockchain, Brazilian style!" },
      { title: "Caipirinha Capo 🍹", tradedMin: 5001, tradedMax: 10000, balance: 0, tooltip: "Saúde, solid trades flowing smooth! You’re mixing crypto like a caipirinha on the chain!" },
      { title: "Favela Fighter ⚽", tradedMin: 1001, tradedMax: 5000, balance: 0, tooltip: "Tô de boa with steady trades! You’re kicking goals on the blockchain, straight from the streets!" },
      { title: "Mano Mover 😎", tradedMin: 251, tradedMax: 1000, balance: 0, tooltip: "Pequeno but powerful trades! You’re hustling like a São Paulo street vendor, mano!" },
      { title: "Novato 😄", tradedMin: 51, tradedMax: 250, balance: 0, tooltip: "Começando agora, né? Tiny trades, but every real counts. Vai com tudo, blockchain’s waiting!" },
      { title: "Sem Grana 😢", tradedMin: 0, tradedMax: 50, balance: 0, tooltip: "Poxa, mano, carteira vazia? No trades, no reais! Corre atrás, senão blockchain vai zoar você!" },
    ],
  };

  const selectedTitles = titles[vibeStyle] || titles.nigerian;
  for (const { title, tradedMin, tradedMax, balance: balanceThreshold, tooltip } of selectedTitles) {
    if (traded >= tradedMin && traded <= tradedMax && balance >= balanceThreshold) {
      return { title, tooltip };
    }
  }
  return selectedTitles[selectedTitles.length - 1];
};

export const isBrokeStatus = (vibeTitle) => {
  const brokeTitles = [
    "Ah! U Broke 😅",
    "Broke Boi 🥶",
    "Broke Chale 😭",
    "Skint Skelm 😜",
    "Broke Bedouin 😅",
    "Pocket Khali 😅",
    "Skint Scally 😅",
    "Skint Skater",
    "Broke Bogan 😫",
    "Sem Grana 😢",
  ];
  return brokeTitles.includes(vibeTitle);
};

export default VibeSelector;