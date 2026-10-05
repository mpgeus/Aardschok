<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.10" tiledversion="1.11.0" name="huizen" tilewidth="614" tileheight="709" tilecount="512" columns="0" objectalignment="bottom">
 <grid orientation="orthogonal" width="1" height="1"/>
 <properties>
  <property name="notitie" value="De huizen van de huizenbouwer (huizen.cjs): de hutten, huizen en boerderijen van ronde 4b en het huis van de schout, en de huizen van de bouwstijlen in hun vier standen. Zet ze neer op de tegel linksboven van hun voet (&quot;beslaat&quot;); &quot;deur&quot; is de tegel voor de deur, gerekend vanaf die tegel. Een plaatje per tekening (tegels/huizen/): het spel laadt een tekening pas als hij op de kaart staat. In Tiled staan de voorwerpen daardoor niet precies op hun plek; het spel zet ze neer met hun eigen anker (tegels.json)."/>
 </properties>
 <tile id="0">
  <properties>
    <property name="naam" value="hut1"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x4"/>
    <property name="deur" value="2,4"/>
  </properties>
  <image source="huizen/hut1.png" width="376" height="411"/>
 </tile>
 <tile id="1">
  <properties>
    <property name="naam" value="hut2"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="4x5"/>
    <property name="deur" value="4,2"/>
  </properties>
  <image source="huizen/hut2.png" width="376" height="400"/>
 </tile>
 <tile id="2">
  <properties>
    <property name="naam" value="hut3"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x4"/>
    <property name="deur" value="2,4"/>
  </properties>
  <image source="huizen/hut3.png" width="408" height="424"/>
 </tile>
 <tile id="3">
  <properties>
    <property name="naam" value="hut4"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x6"/>
    <property name="deur" value="2,6"/>
  </properties>
  <image source="huizen/hut4.png" width="408" height="446"/>
 </tile>
 <tile id="4">
  <properties>
    <property name="naam" value="huis1"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/huis1.png" width="472" height="508"/>
 </tile>
 <tile id="5">
  <properties>
    <property name="naam" value="huis2"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,2"/>
  </properties>
  <image source="huizen/huis2.png" width="474" height="564"/>
 </tile>
 <tile id="6">
  <properties>
    <property name="naam" value="huis3"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/huis3.png" width="504" height="529"/>
 </tile>
 <tile id="7">
  <properties>
    <property name="naam" value="huis4"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="3,8"/>
  </properties>
  <image source="huizen/huis4.png" width="514" height="567"/>
 </tile>
 <tile id="8">
  <properties>
    <property name="naam" value="huis5"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,5"/>
  </properties>
  <image source="huizen/huis5.png" width="440" height="533"/>
 </tile>
 <tile id="9">
  <properties>
    <property name="naam" value="huis6"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="2,9"/>
  </properties>
  <image source="huizen/huis6.png" width="550" height="540"/>
 </tile>
 <tile id="10">
  <properties>
    <property name="naam" value="boerderij1"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,3"/>
  </properties>
  <image source="huizen/boerderij1.png" width="595" height="534"/>
 </tile>
 <tile id="11">
  <properties>
    <property name="naam" value="boerderij2"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="5,8"/>
  </properties>
  <image source="huizen/boerderij2.png" width="536" height="532"/>
 </tile>
 <tile id="12">
  <properties>
    <property name="naam" value="boerderij3"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/boerderij3.png" width="569" height="631"/>
 </tile>
 <tile id="13">
  <properties>
    <property name="naam" value="boerderij4"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/boerderij4.png" width="540" height="552"/>
 </tile>
 <tile id="14">
  <properties>
    <property name="naam" value="boerderij5"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="6,4"/>
  </properties>
  <image source="huizen/boerderij5.png" width="508" height="477"/>
 </tile>
 <tile id="15">
  <properties>
    <property name="naam" value="schoutshuis"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/schoutshuis.png" width="577" height="709"/>
 </tile>
 <tile id="16">
  <properties>
    <property name="naam" value="herberg1"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x11"/>
    <property name="deur" value="8,5"/>
  </properties>
  <image source="huizen/herberg1.png" width="600" height="613"/>
 </tile>
 <tile id="17">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="18">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="19">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="20">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="21">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="22">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="23">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="24">
  <properties>
    <property name="naam" value="steen1"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/steen1.png" width="472" height="508"/>
 </tile>
 <tile id="25">
  <properties>
    <property name="naam" value="steen2"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,2"/>
  </properties>
  <image source="huizen/steen2.png" width="474" height="564"/>
 </tile>
 <tile id="26">
  <properties>
    <property name="naam" value="steen3"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="8,2"/>
  </properties>
  <image source="huizen/steen3.png" width="504" height="529"/>
 </tile>
 <tile id="27">
  <properties>
    <property name="naam" value="steen4"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="3,8"/>
  </properties>
  <image source="huizen/steen4.png" width="514" height="567"/>
 </tile>
 <tile id="28">
  <properties>
    <property name="naam" value="steen5"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,5"/>
  </properties>
  <image source="huizen/steen5.png" width="440" height="533"/>
 </tile>
 <tile id="29">
  <properties>
    <property name="naam" value="steen6"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="2,9"/>
  </properties>
  <image source="huizen/steen6.png" width="550" height="540"/>
 </tile>
 <tile id="30">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="31">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="32">
  <properties>
    <property name="naam" value="wit-hut1-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x4"/>
    <property name="deur" value="2,4"/>
  </properties>
  <image source="huizen/wit-hut1-riet-z.png" width="386" height="425"/>
 </tile>
 <tile id="33">
  <properties>
    <property name="naam" value="wit-hut1-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="4x6"/>
    <property name="deur" value="4,3"/>
  </properties>
  <image source="huizen/wit-hut1-riet-o.png" width="386" height="415"/>
 </tile>
 <tile id="34">
  <properties>
    <property name="naam" value="wit-hut1-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x4"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/wit-hut1-riet-n.png" width="386" height="415"/>
 </tile>
 <tile id="35">
  <properties>
    <property name="naam" value="wit-hut1-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="4x6"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/wit-hut1-riet-w.png" width="386" height="427"/>
 </tile>
 <tile id="36">
  <properties>
    <property name="naam" value="wit-hut3-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x4"/>
    <property name="deur" value="3,4"/>
  </properties>
  <image source="huizen/wit-hut3-riet-z.png" width="418" height="439"/>
 </tile>
 <tile id="37">
  <properties>
    <property name="naam" value="wit-hut3-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="4x6"/>
    <property name="deur" value="4,2"/>
  </properties>
  <image source="huizen/wit-hut3-riet-o.png" width="418" height="434"/>
 </tile>
 <tile id="38">
  <properties>
    <property name="naam" value="wit-hut3-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x4"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/wit-hut3-riet-n.png" width="418" height="434"/>
 </tile>
 <tile id="39">
  <properties>
    <property name="naam" value="wit-hut3-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="4x6"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/wit-hut3-riet-w.png" width="418" height="439"/>
 </tile>
 <tile id="40">
  <properties>
    <property name="naam" value="wit-hut4-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x6"/>
    <property name="deur" value="5,6"/>
  </properties>
  <image source="huizen/wit-hut4-riet-z.png" width="418" height="467"/>
 </tile>
 <tile id="41">
  <properties>
    <property name="naam" value="wit-hut4-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x6"/>
    <property name="deur" value="6,0"/>
  </properties>
  <image source="huizen/wit-hut4-riet-o.png" width="484" height="396"/>
 </tile>
 <tile id="42">
  <properties>
    <property name="naam" value="wit-hut4-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x6"/>
    <property name="deur" value="0,-1"/>
  </properties>
  <image source="huizen/wit-hut4-riet-n.png" width="418" height="471"/>
 </tile>
 <tile id="43">
  <properties>
    <property name="naam" value="wit-hut4-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x6"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/wit-hut4-riet-w.png" width="484" height="429"/>
 </tile>
 <tile id="44">
  <properties>
    <property name="naam" value="wit-huis1-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/wit-huis1-riet-z.png" width="482" height="523"/>
 </tile>
 <tile id="45">
  <properties>
    <property name="naam" value="wit-huis1-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/wit-huis1-riet-o.png" width="482" height="525"/>
 </tile>
 <tile id="46">
  <properties>
    <property name="naam" value="wit-huis1-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/wit-huis1-riet-n.png" width="482" height="525"/>
 </tile>
 <tile id="47">
  <properties>
    <property name="naam" value="wit-huis1-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/wit-huis1-riet-w.png" width="482" height="523"/>
 </tile>
 <tile id="48">
  <properties>
    <property name="naam" value="wit-huis1-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/wit-huis1-leien-z.png" width="446" height="488"/>
 </tile>
 <tile id="49">
  <properties>
    <property name="naam" value="wit-huis1-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/wit-huis1-leien-o.png" width="446" height="489"/>
 </tile>
 <tile id="50">
  <properties>
    <property name="naam" value="wit-huis1-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/wit-huis1-leien-n.png" width="446" height="489"/>
 </tile>
 <tile id="51">
  <properties>
    <property name="naam" value="wit-huis1-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/wit-huis1-leien-w.png" width="446" height="494"/>
 </tile>
 <tile id="52">
  <properties>
    <property name="naam" value="wit-huis1-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/wit-huis1-pannen-z.png" width="445" height="449"/>
 </tile>
 <tile id="53">
  <properties>
    <property name="naam" value="wit-huis1-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/wit-huis1-pannen-o.png" width="445" height="450"/>
 </tile>
 <tile id="54">
  <properties>
    <property name="naam" value="wit-huis1-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/wit-huis1-pannen-n.png" width="445" height="450"/>
 </tile>
 <tile id="55">
  <properties>
    <property name="naam" value="wit-huis1-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/wit-huis1-pannen-w.png" width="445" height="456"/>
 </tile>
 <tile id="56">
  <properties>
    <property name="naam" value="wit-steen1-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/wit-steen1-leien-z.png" width="446" height="488"/>
 </tile>
 <tile id="57">
  <properties>
    <property name="naam" value="wit-steen1-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/wit-steen1-leien-o.png" width="446" height="489"/>
 </tile>
 <tile id="58">
  <properties>
    <property name="naam" value="wit-steen1-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/wit-steen1-leien-n.png" width="446" height="489"/>
 </tile>
 <tile id="59">
  <properties>
    <property name="naam" value="wit-steen1-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/wit-steen1-leien-w.png" width="446" height="494"/>
 </tile>
 <tile id="60">
  <properties>
    <property name="naam" value="wit-steen1-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/wit-steen1-pannen-z.png" width="445" height="449"/>
 </tile>
 <tile id="61">
  <properties>
    <property name="naam" value="wit-steen1-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/wit-steen1-pannen-o.png" width="445" height="450"/>
 </tile>
 <tile id="62">
  <properties>
    <property name="naam" value="wit-steen1-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/wit-steen1-pannen-n.png" width="445" height="450"/>
 </tile>
 <tile id="63">
  <properties>
    <property name="naam" value="wit-steen1-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/wit-steen1-pannen-w.png" width="445" height="456"/>
 </tile>
 <tile id="64">
  <properties>
    <property name="naam" value="wit-steen1-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/wit-steen1-baksteen-z.png" width="445" height="449"/>
 </tile>
 <tile id="65">
  <properties>
    <property name="naam" value="wit-steen1-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/wit-steen1-baksteen-o.png" width="445" height="450"/>
 </tile>
 <tile id="66">
  <properties>
    <property name="naam" value="wit-steen1-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/wit-steen1-baksteen-n.png" width="445" height="450"/>
 </tile>
 <tile id="67">
  <properties>
    <property name="naam" value="wit-steen1-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/wit-steen1-baksteen-w.png" width="445" height="456"/>
 </tile>
 <tile id="68">
  <properties>
    <property name="naam" value="wit-huis3-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/wit-huis3-riet-z.png" width="514" height="544"/>
 </tile>
 <tile id="69">
  <properties>
    <property name="naam" value="wit-huis3-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,2"/>
  </properties>
  <image source="huizen/wit-huis3-riet-o.png" width="539" height="520"/>
 </tile>
 <tile id="70">
  <properties>
    <property name="naam" value="wit-huis3-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/wit-huis3-riet-n.png" width="514" height="520"/>
 </tile>
 <tile id="71">
  <properties>
    <property name="naam" value="wit-huis3-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/wit-huis3-riet-w.png" width="540" height="518"/>
 </tile>
 <tile id="72">
  <properties>
    <property name="naam" value="wit-huis3-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/wit-huis3-leien-z.png" width="480" height="506"/>
 </tile>
 <tile id="73">
  <properties>
    <property name="naam" value="wit-huis3-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,2"/>
  </properties>
  <image source="huizen/wit-huis3-leien-o.png" width="521" height="483"/>
 </tile>
 <tile id="74">
  <properties>
    <property name="naam" value="wit-huis3-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/wit-huis3-leien-n.png" width="480" height="483"/>
 </tile>
 <tile id="75">
  <properties>
    <property name="naam" value="wit-huis3-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/wit-huis3-leien-w.png" width="521" height="480"/>
 </tile>
 <tile id="76">
  <properties>
    <property name="naam" value="wit-huis3-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/wit-huis3-pannen-z.png" width="480" height="474"/>
 </tile>
 <tile id="77">
  <properties>
    <property name="naam" value="wit-huis3-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,2"/>
  </properties>
  <image source="huizen/wit-huis3-pannen-o.png" width="521" height="450"/>
 </tile>
 <tile id="78">
  <properties>
    <property name="naam" value="wit-huis3-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/wit-huis3-pannen-n.png" width="480" height="450"/>
 </tile>
 <tile id="79">
  <properties>
    <property name="naam" value="wit-huis3-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/wit-huis3-pannen-w.png" width="521" height="448"/>
 </tile>
 <tile id="80">
  <properties>
    <property name="naam" value="wit-steen3-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/wit-steen3-leien-z.png" width="480" height="506"/>
 </tile>
 <tile id="81">
  <properties>
    <property name="naam" value="wit-steen3-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="7,1"/>
  </properties>
  <image source="huizen/wit-steen3-leien-o.png" width="521" height="483"/>
 </tile>
 <tile id="82">
  <properties>
    <property name="naam" value="wit-steen3-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="1,-1"/>
  </properties>
  <image source="huizen/wit-steen3-leien-n.png" width="480" height="483"/>
 </tile>
 <tile id="83">
  <properties>
    <property name="naam" value="wit-steen3-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/wit-steen3-leien-w.png" width="521" height="480"/>
 </tile>
 <tile id="84">
  <properties>
    <property name="naam" value="wit-steen3-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/wit-steen3-pannen-z.png" width="480" height="474"/>
 </tile>
 <tile id="85">
  <properties>
    <property name="naam" value="wit-steen3-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="7,1"/>
  </properties>
  <image source="huizen/wit-steen3-pannen-o.png" width="521" height="450"/>
 </tile>
 <tile id="86">
  <properties>
    <property name="naam" value="wit-steen3-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="1,-1"/>
  </properties>
  <image source="huizen/wit-steen3-pannen-n.png" width="480" height="450"/>
 </tile>
 <tile id="87">
  <properties>
    <property name="naam" value="wit-steen3-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/wit-steen3-pannen-w.png" width="521" height="448"/>
 </tile>
 <tile id="88">
  <properties>
    <property name="naam" value="wit-steen3-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/wit-steen3-baksteen-z.png" width="480" height="474"/>
 </tile>
 <tile id="89">
  <properties>
    <property name="naam" value="wit-steen3-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="7,1"/>
  </properties>
  <image source="huizen/wit-steen3-baksteen-o.png" width="521" height="450"/>
 </tile>
 <tile id="90">
  <properties>
    <property name="naam" value="wit-steen3-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="1,-1"/>
  </properties>
  <image source="huizen/wit-steen3-baksteen-n.png" width="480" height="450"/>
 </tile>
 <tile id="91">
  <properties>
    <property name="naam" value="wit-steen3-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/wit-steen3-baksteen-w.png" width="521" height="448"/>
 </tile>
 <tile id="92">
  <properties>
    <property name="naam" value="wit-huis6-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="5,8"/>
  </properties>
  <image source="huizen/wit-huis6-riet-z.png" width="546" height="549"/>
 </tile>
 <tile id="93">
  <properties>
    <property name="naam" value="wit-huis6-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/wit-huis6-riet-o.png" width="582" height="533"/>
 </tile>
 <tile id="94">
  <properties>
    <property name="naam" value="wit-huis6-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/wit-huis6-riet-n.png" width="546" height="535"/>
 </tile>
 <tile id="95">
  <properties>
    <property name="naam" value="wit-huis6-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/wit-huis6-riet-w.png" width="582" height="550"/>
 </tile>
 <tile id="96">
  <properties>
    <property name="naam" value="wit-huis6-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="5,8"/>
  </properties>
  <image source="huizen/wit-huis6-leien-z.png" width="516" height="523"/>
 </tile>
 <tile id="97">
  <properties>
    <property name="naam" value="wit-huis6-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/wit-huis6-leien-o.png" width="550" height="495"/>
 </tile>
 <tile id="98">
  <properties>
    <property name="naam" value="wit-huis6-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/wit-huis6-leien-n.png" width="516" height="495"/>
 </tile>
 <tile id="99">
  <properties>
    <property name="naam" value="wit-huis6-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/wit-huis6-leien-w.png" width="550" height="528"/>
 </tile>
 <tile id="100">
  <properties>
    <property name="naam" value="wit-huis6-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="5,8"/>
  </properties>
  <image source="huizen/wit-huis6-pannen-z.png" width="514" height="491"/>
 </tile>
 <tile id="101">
  <properties>
    <property name="naam" value="wit-huis6-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/wit-huis6-pannen-o.png" width="548" height="463"/>
 </tile>
 <tile id="102">
  <properties>
    <property name="naam" value="wit-huis6-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/wit-huis6-pannen-n.png" width="514" height="468"/>
 </tile>
 <tile id="103">
  <properties>
    <property name="naam" value="wit-huis6-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/wit-huis6-pannen-w.png" width="548" height="496"/>
 </tile>
 <tile id="104">
  <properties>
    <property name="naam" value="wit-steen6-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="5,8"/>
  </properties>
  <image source="huizen/wit-steen6-leien-z.png" width="516" height="523"/>
 </tile>
 <tile id="105">
  <properties>
    <property name="naam" value="wit-steen6-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/wit-steen6-leien-o.png" width="550" height="495"/>
 </tile>
 <tile id="106">
  <properties>
    <property name="naam" value="wit-steen6-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/wit-steen6-leien-n.png" width="516" height="495"/>
 </tile>
 <tile id="107">
  <properties>
    <property name="naam" value="wit-steen6-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/wit-steen6-leien-w.png" width="550" height="528"/>
 </tile>
 <tile id="108">
  <properties>
    <property name="naam" value="wit-steen6-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="5,8"/>
  </properties>
  <image source="huizen/wit-steen6-pannen-z.png" width="514" height="491"/>
 </tile>
 <tile id="109">
  <properties>
    <property name="naam" value="wit-steen6-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/wit-steen6-pannen-o.png" width="548" height="463"/>
 </tile>
 <tile id="110">
  <properties>
    <property name="naam" value="wit-steen6-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/wit-steen6-pannen-n.png" width="514" height="468"/>
 </tile>
 <tile id="111">
  <properties>
    <property name="naam" value="wit-steen6-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/wit-steen6-pannen-w.png" width="548" height="496"/>
 </tile>
 <tile id="112">
  <properties>
    <property name="naam" value="wit-steen6-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="5,8"/>
  </properties>
  <image source="huizen/wit-steen6-baksteen-z.png" width="514" height="491"/>
 </tile>
 <tile id="113">
  <properties>
    <property name="naam" value="wit-steen6-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/wit-steen6-baksteen-o.png" width="548" height="463"/>
 </tile>
 <tile id="114">
  <properties>
    <property name="naam" value="wit-steen6-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/wit-steen6-baksteen-n.png" width="514" height="468"/>
 </tile>
 <tile id="115">
  <properties>
    <property name="naam" value="wit-steen6-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/wit-steen6-baksteen-w.png" width="548" height="496"/>
 </tile>
 <tile id="116">
  <properties>
    <property name="naam" value="wit-boerderij1-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/wit-boerderij1-riet-z.png" width="608" height="549"/>
 </tile>
 <tile id="117">
  <properties>
    <property name="naam" value="wit-boerderij1-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/wit-boerderij1-riet-o.png" width="546" height="587"/>
 </tile>
 <tile id="118">
  <properties>
    <property name="naam" value="wit-boerderij1-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/wit-boerderij1-riet-n.png" width="608" height="507"/>
 </tile>
 <tile id="119">
  <properties>
    <property name="naam" value="wit-boerderij1-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/wit-boerderij1-riet-w.png" width="546" height="579"/>
 </tile>
 <tile id="120">
  <properties>
    <property name="naam" value="wit-boerderij1-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/wit-boerderij1-leien-z.png" width="573" height="512"/>
 </tile>
 <tile id="121">
  <properties>
    <property name="naam" value="wit-boerderij1-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/wit-boerderij1-leien-o.png" width="520" height="550"/>
 </tile>
 <tile id="122">
  <properties>
    <property name="naam" value="wit-boerderij1-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/wit-boerderij1-leien-n.png" width="573" height="478"/>
 </tile>
 <tile id="123">
  <properties>
    <property name="naam" value="wit-boerderij1-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/wit-boerderij1-leien-w.png" width="521" height="543"/>
 </tile>
 <tile id="124">
  <properties>
    <property name="naam" value="wit-boerderij1-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/wit-boerderij1-pannen-z.png" width="572" height="476"/>
 </tile>
 <tile id="125">
  <properties>
    <property name="naam" value="wit-boerderij1-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/wit-boerderij1-pannen-o.png" width="521" height="514"/>
 </tile>
 <tile id="126">
  <properties>
    <property name="naam" value="wit-boerderij1-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/wit-boerderij1-pannen-n.png" width="572" height="443"/>
 </tile>
 <tile id="127">
  <properties>
    <property name="naam" value="wit-boerderij1-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/wit-boerderij1-pannen-w.png" width="521" height="508"/>
 </tile>
 <tile id="128">
  <properties>
    <property name="naam" value="wit-boerderij4-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/wit-boerderij4-riet-z.png" width="546" height="566"/>
 </tile>
 <tile id="129">
  <properties>
    <property name="naam" value="wit-boerderij4-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,3"/>
  </properties>
  <image source="huizen/wit-boerderij4-riet-o.png" width="546" height="577"/>
 </tile>
 <tile id="130">
  <properties>
    <property name="naam" value="wit-boerderij4-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/wit-boerderij4-riet-n.png" width="546" height="577"/>
 </tile>
 <tile id="131">
  <properties>
    <property name="naam" value="wit-boerderij4-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/wit-boerderij4-riet-w.png" width="546" height="566"/>
 </tile>
 <tile id="132">
  <properties>
    <property name="naam" value="wit-boerderij4-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/wit-boerderij4-leien-z.png" width="518" height="532"/>
 </tile>
 <tile id="133">
  <properties>
    <property name="naam" value="wit-boerderij4-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,3"/>
  </properties>
  <image source="huizen/wit-boerderij4-leien-o.png" width="518" height="543"/>
 </tile>
 <tile id="134">
  <properties>
    <property name="naam" value="wit-boerderij4-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/wit-boerderij4-leien-n.png" width="518" height="543"/>
 </tile>
 <tile id="135">
  <properties>
    <property name="naam" value="wit-boerderij4-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/wit-boerderij4-leien-w.png" width="518" height="532"/>
 </tile>
 <tile id="136">
  <properties>
    <property name="naam" value="wit-boerderij4-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/wit-boerderij4-pannen-z.png" width="517" height="488"/>
 </tile>
 <tile id="137">
  <properties>
    <property name="naam" value="wit-boerderij4-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,3"/>
  </properties>
  <image source="huizen/wit-boerderij4-pannen-o.png" width="517" height="499"/>
 </tile>
 <tile id="138">
  <properties>
    <property name="naam" value="wit-boerderij4-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/wit-boerderij4-pannen-n.png" width="517" height="499"/>
 </tile>
 <tile id="139">
  <properties>
    <property name="naam" value="wit-boerderij4-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/wit-boerderij4-pannen-w.png" width="517" height="488"/>
 </tile>
 <tile id="140">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="141">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="142">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="143">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="144">
  <properties>
    <property name="naam" value="oker-huis2-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/oker-huis2-riet-z.png" width="482" height="579"/>
 </tile>
 <tile id="145">
  <properties>
    <property name="naam" value="oker-huis2-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/oker-huis2-riet-o.png" width="482" height="583"/>
 </tile>
 <tile id="146">
  <properties>
    <property name="naam" value="oker-huis2-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/oker-huis2-riet-n.png" width="482" height="583"/>
 </tile>
 <tile id="147">
  <properties>
    <property name="naam" value="oker-huis2-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/oker-huis2-riet-w.png" width="482" height="579"/>
 </tile>
 <tile id="148">
  <properties>
    <property name="naam" value="oker-huis2-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/oker-huis2-leien-z.png" width="451" height="543"/>
 </tile>
 <tile id="149">
  <properties>
    <property name="naam" value="oker-huis2-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/oker-huis2-leien-o.png" width="451" height="547"/>
 </tile>
 <tile id="150">
  <properties>
    <property name="naam" value="oker-huis2-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/oker-huis2-leien-n.png" width="451" height="550"/>
 </tile>
 <tile id="151">
  <properties>
    <property name="naam" value="oker-huis2-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/oker-huis2-leien-w.png" width="451" height="543"/>
 </tile>
 <tile id="152">
  <properties>
    <property name="naam" value="oker-huis2-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/oker-huis2-pannen-z.png" width="451" height="505"/>
 </tile>
 <tile id="153">
  <properties>
    <property name="naam" value="oker-huis2-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/oker-huis2-pannen-o.png" width="451" height="508"/>
 </tile>
 <tile id="154">
  <properties>
    <property name="naam" value="oker-huis2-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/oker-huis2-pannen-n.png" width="451" height="513"/>
 </tile>
 <tile id="155">
  <properties>
    <property name="naam" value="oker-huis2-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/oker-huis2-pannen-w.png" width="451" height="505"/>
 </tile>
 <tile id="156">
  <properties>
    <property name="naam" value="oker-steen2-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/oker-steen2-leien-z.png" width="451" height="543"/>
 </tile>
 <tile id="157">
  <properties>
    <property name="naam" value="oker-steen2-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/oker-steen2-leien-o.png" width="451" height="547"/>
 </tile>
 <tile id="158">
  <properties>
    <property name="naam" value="oker-steen2-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/oker-steen2-leien-n.png" width="451" height="550"/>
 </tile>
 <tile id="159">
  <properties>
    <property name="naam" value="oker-steen2-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/oker-steen2-leien-w.png" width="451" height="543"/>
 </tile>
 <tile id="160">
  <properties>
    <property name="naam" value="oker-steen2-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/oker-steen2-pannen-z.png" width="451" height="505"/>
 </tile>
 <tile id="161">
  <properties>
    <property name="naam" value="oker-steen2-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/oker-steen2-pannen-o.png" width="451" height="508"/>
 </tile>
 <tile id="162">
  <properties>
    <property name="naam" value="oker-steen2-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/oker-steen2-pannen-n.png" width="451" height="513"/>
 </tile>
 <tile id="163">
  <properties>
    <property name="naam" value="oker-steen2-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/oker-steen2-pannen-w.png" width="451" height="505"/>
 </tile>
 <tile id="164">
  <properties>
    <property name="naam" value="oker-steen2-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/oker-steen2-baksteen-z.png" width="451" height="505"/>
 </tile>
 <tile id="165">
  <properties>
    <property name="naam" value="oker-steen2-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/oker-steen2-baksteen-o.png" width="451" height="508"/>
 </tile>
 <tile id="166">
  <properties>
    <property name="naam" value="oker-steen2-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/oker-steen2-baksteen-n.png" width="451" height="513"/>
 </tile>
 <tile id="167">
  <properties>
    <property name="naam" value="oker-steen2-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/oker-steen2-baksteen-w.png" width="451" height="505"/>
 </tile>
 <tile id="168">
  <properties>
    <property name="naam" value="oker-huis4-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/oker-huis4-riet-z.png" width="514" height="580"/>
 </tile>
 <tile id="169">
  <properties>
    <property name="naam" value="oker-huis4-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/oker-huis4-riet-o.png" width="614" height="522"/>
 </tile>
 <tile id="170">
  <properties>
    <property name="naam" value="oker-huis4-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-huis4-riet-n.png" width="514" height="573"/>
 </tile>
 <tile id="171">
  <properties>
    <property name="naam" value="oker-huis4-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/oker-huis4-riet-w.png" width="614" height="482"/>
 </tile>
 <tile id="172">
  <properties>
    <property name="naam" value="oker-huis4-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/oker-huis4-leien-z.png" width="484" height="543"/>
 </tile>
 <tile id="173">
  <properties>
    <property name="naam" value="oker-huis4-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/oker-huis4-leien-o.png" width="583" height="485"/>
 </tile>
 <tile id="174">
  <properties>
    <property name="naam" value="oker-huis4-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-huis4-leien-n.png" width="484" height="552"/>
 </tile>
 <tile id="175">
  <properties>
    <property name="naam" value="oker-huis4-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/oker-huis4-leien-w.png" width="583" height="452"/>
 </tile>
 <tile id="176">
  <properties>
    <property name="naam" value="oker-huis4-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/oker-huis4-pannen-z.png" width="484" height="509"/>
 </tile>
 <tile id="177">
  <properties>
    <property name="naam" value="oker-huis4-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/oker-huis4-pannen-o.png" width="581" height="451"/>
 </tile>
 <tile id="178">
  <properties>
    <property name="naam" value="oker-huis4-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-huis4-pannen-n.png" width="484" height="518"/>
 </tile>
 <tile id="179">
  <properties>
    <property name="naam" value="oker-huis4-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/oker-huis4-pannen-w.png" width="582" height="418"/>
 </tile>
 <tile id="180">
  <properties>
    <property name="naam" value="oker-steen4-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/oker-steen4-leien-z.png" width="484" height="543"/>
 </tile>
 <tile id="181">
  <properties>
    <property name="naam" value="oker-steen4-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/oker-steen4-leien-o.png" width="583" height="485"/>
 </tile>
 <tile id="182">
  <properties>
    <property name="naam" value="oker-steen4-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-steen4-leien-n.png" width="484" height="552"/>
 </tile>
 <tile id="183">
  <properties>
    <property name="naam" value="oker-steen4-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/oker-steen4-leien-w.png" width="583" height="452"/>
 </tile>
 <tile id="184">
  <properties>
    <property name="naam" value="oker-steen4-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/oker-steen4-pannen-z.png" width="484" height="509"/>
 </tile>
 <tile id="185">
  <properties>
    <property name="naam" value="oker-steen4-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/oker-steen4-pannen-o.png" width="581" height="451"/>
 </tile>
 <tile id="186">
  <properties>
    <property name="naam" value="oker-steen4-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-steen4-pannen-n.png" width="484" height="518"/>
 </tile>
 <tile id="187">
  <properties>
    <property name="naam" value="oker-steen4-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/oker-steen4-pannen-w.png" width="582" height="418"/>
 </tile>
 <tile id="188">
  <properties>
    <property name="naam" value="oker-steen4-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/oker-steen4-baksteen-z.png" width="484" height="509"/>
 </tile>
 <tile id="189">
  <properties>
    <property name="naam" value="oker-steen4-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/oker-steen4-baksteen-o.png" width="581" height="451"/>
 </tile>
 <tile id="190">
  <properties>
    <property name="naam" value="oker-steen4-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-steen4-baksteen-n.png" width="484" height="518"/>
 </tile>
 <tile id="191">
  <properties>
    <property name="naam" value="oker-steen4-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/oker-steen4-baksteen-w.png" width="582" height="418"/>
 </tile>
 <tile id="192">
  <properties>
    <property name="naam" value="oker-huis5-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,5"/>
  </properties>
  <image source="huizen/oker-huis5-riet-z.png" width="450" height="549"/>
 </tile>
 <tile id="193">
  <properties>
    <property name="naam" value="oker-huis5-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,3"/>
  </properties>
  <image source="huizen/oker-huis5-riet-o.png" width="450" height="550"/>
 </tile>
 <tile id="194">
  <properties>
    <property name="naam" value="oker-huis5-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-huis5-riet-n.png" width="450" height="572"/>
 </tile>
 <tile id="195">
  <properties>
    <property name="naam" value="oker-huis5-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/oker-huis5-riet-w.png" width="450" height="549"/>
 </tile>
 <tile id="196">
  <properties>
    <property name="naam" value="oker-huis5-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,5"/>
  </properties>
  <image source="huizen/oker-huis5-leien-z.png" width="412" height="512"/>
 </tile>
 <tile id="197">
  <properties>
    <property name="naam" value="oker-huis5-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,3"/>
  </properties>
  <image source="huizen/oker-huis5-leien-o.png" width="413" height="513"/>
 </tile>
 <tile id="198">
  <properties>
    <property name="naam" value="oker-huis5-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-huis5-leien-n.png" width="413" height="536"/>
 </tile>
 <tile id="199">
  <properties>
    <property name="naam" value="oker-huis5-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/oker-huis5-leien-w.png" width="412" height="512"/>
 </tile>
 <tile id="200">
  <properties>
    <property name="naam" value="oker-huis5-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,5"/>
  </properties>
  <image source="huizen/oker-huis5-pannen-z.png" width="412" height="478"/>
 </tile>
 <tile id="201">
  <properties>
    <property name="naam" value="oker-huis5-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,3"/>
  </properties>
  <image source="huizen/oker-huis5-pannen-o.png" width="412" height="486"/>
 </tile>
 <tile id="202">
  <properties>
    <property name="naam" value="oker-huis5-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-huis5-pannen-n.png" width="412" height="510"/>
 </tile>
 <tile id="203">
  <properties>
    <property name="naam" value="oker-huis5-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/oker-huis5-pannen-w.png" width="412" height="478"/>
 </tile>
 <tile id="204">
  <properties>
    <property name="naam" value="oker-steen5-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,5"/>
  </properties>
  <image source="huizen/oker-steen5-leien-z.png" width="412" height="512"/>
 </tile>
 <tile id="205">
  <properties>
    <property name="naam" value="oker-steen5-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,3"/>
  </properties>
  <image source="huizen/oker-steen5-leien-o.png" width="413" height="513"/>
 </tile>
 <tile id="206">
  <properties>
    <property name="naam" value="oker-steen5-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-steen5-leien-n.png" width="413" height="536"/>
 </tile>
 <tile id="207">
  <properties>
    <property name="naam" value="oker-steen5-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/oker-steen5-leien-w.png" width="412" height="512"/>
 </tile>
 <tile id="208">
  <properties>
    <property name="naam" value="oker-steen5-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,5"/>
  </properties>
  <image source="huizen/oker-steen5-pannen-z.png" width="412" height="478"/>
 </tile>
 <tile id="209">
  <properties>
    <property name="naam" value="oker-steen5-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,3"/>
  </properties>
  <image source="huizen/oker-steen5-pannen-o.png" width="412" height="486"/>
 </tile>
 <tile id="210">
  <properties>
    <property name="naam" value="oker-steen5-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-steen5-pannen-n.png" width="412" height="510"/>
 </tile>
 <tile id="211">
  <properties>
    <property name="naam" value="oker-steen5-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/oker-steen5-pannen-w.png" width="412" height="478"/>
 </tile>
 <tile id="212">
  <properties>
    <property name="naam" value="oker-steen5-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,5"/>
  </properties>
  <image source="huizen/oker-steen5-baksteen-z.png" width="412" height="478"/>
 </tile>
 <tile id="213">
  <properties>
    <property name="naam" value="oker-steen5-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,3"/>
  </properties>
  <image source="huizen/oker-steen5-baksteen-o.png" width="412" height="486"/>
 </tile>
 <tile id="214">
  <properties>
    <property name="naam" value="oker-steen5-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-steen5-baksteen-n.png" width="412" height="510"/>
 </tile>
 <tile id="215">
  <properties>
    <property name="naam" value="oker-steen5-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/oker-steen5-baksteen-w.png" width="412" height="478"/>
 </tile>
 <tile id="216">
  <properties>
    <property name="naam" value="oker-boerderij6-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/oker-boerderij6-riet-z.png" width="598" height="542"/>
 </tile>
 <tile id="217">
  <properties>
    <property name="naam" value="oker-boerderij6-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x10"/>
    <property name="deur" value="8,5"/>
  </properties>
  <image source="huizen/oker-boerderij6-riet-o.png" width="578" height="560"/>
 </tile>
 <tile id="218">
  <properties>
    <property name="naam" value="oker-boerderij6-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x8"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/oker-boerderij6-riet-n.png" width="598" height="550"/>
 </tile>
 <tile id="219">
  <properties>
    <property name="naam" value="oker-boerderij6-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x10"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/oker-boerderij6-riet-w.png" width="578" height="542"/>
 </tile>
 <tile id="220">
  <properties>
    <property name="naam" value="oker-boerderij6-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/oker-boerderij6-leien-z.png" width="566" height="504"/>
 </tile>
 <tile id="221">
  <properties>
    <property name="naam" value="oker-boerderij6-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x10"/>
    <property name="deur" value="8,5"/>
  </properties>
  <image source="huizen/oker-boerderij6-leien-o.png" width="546" height="522"/>
 </tile>
 <tile id="222">
  <properties>
    <property name="naam" value="oker-boerderij6-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x8"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/oker-boerderij6-leien-n.png" width="566" height="520"/>
 </tile>
 <tile id="223">
  <properties>
    <property name="naam" value="oker-boerderij6-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x10"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/oker-boerderij6-leien-w.png" width="546" height="504"/>
 </tile>
 <tile id="224">
  <properties>
    <property name="naam" value="oker-boerderij6-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/oker-boerderij6-pannen-z.png" width="564" height="473"/>
 </tile>
 <tile id="225">
  <properties>
    <property name="naam" value="oker-boerderij6-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x10"/>
    <property name="deur" value="8,5"/>
  </properties>
  <image source="huizen/oker-boerderij6-pannen-o.png" width="544" height="490"/>
 </tile>
 <tile id="226">
  <properties>
    <property name="naam" value="oker-boerderij6-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x8"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/oker-boerderij6-pannen-n.png" width="564" height="489"/>
 </tile>
 <tile id="227">
  <properties>
    <property name="naam" value="oker-boerderij6-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x10"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/oker-boerderij6-pannen-w.png" width="544" height="474"/>
 </tile>
 <tile id="228">
  <properties>
    <property name="naam" value="oker-boerderij7-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="3,6"/>
  </properties>
  <image source="huizen/oker-boerderij7-riet-z.png" width="578" height="625"/>
 </tile>
 <tile id="229">
  <properties>
    <property name="naam" value="oker-boerderij7-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="6,5"/>
  </properties>
  <image source="huizen/oker-boerderij7-riet-o.png" width="578" height="619"/>
 </tile>
 <tile id="230">
  <properties>
    <property name="naam" value="oker-boerderij7-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/oker-boerderij7-riet-n.png" width="578" height="619"/>
 </tile>
 <tile id="231">
  <properties>
    <property name="naam" value="oker-boerderij7-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/oker-boerderij7-riet-w.png" width="578" height="625"/>
 </tile>
 <tile id="232">
  <properties>
    <property name="naam" value="oker-boerderij7-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="3,6"/>
  </properties>
  <image source="huizen/oker-boerderij7-leien-z.png" width="548" height="590"/>
 </tile>
 <tile id="233">
  <properties>
    <property name="naam" value="oker-boerderij7-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="6,5"/>
  </properties>
  <image source="huizen/oker-boerderij7-leien-o.png" width="548" height="584"/>
 </tile>
 <tile id="234">
  <properties>
    <property name="naam" value="oker-boerderij7-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/oker-boerderij7-leien-n.png" width="548" height="584"/>
 </tile>
 <tile id="235">
  <properties>
    <property name="naam" value="oker-boerderij7-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/oker-boerderij7-leien-w.png" width="548" height="590"/>
 </tile>
 <tile id="236">
  <properties>
    <property name="naam" value="oker-boerderij7-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="3,6"/>
  </properties>
  <image source="huizen/oker-boerderij7-pannen-z.png" width="548" height="551"/>
 </tile>
 <tile id="237">
  <properties>
    <property name="naam" value="oker-boerderij7-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="6,5"/>
  </properties>
  <image source="huizen/oker-boerderij7-pannen-o.png" width="548" height="545"/>
 </tile>
 <tile id="238">
  <properties>
    <property name="naam" value="oker-boerderij7-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/oker-boerderij7-pannen-n.png" width="548" height="545"/>
 </tile>
 <tile id="239">
  <properties>
    <property name="naam" value="oker-boerderij7-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/oker-boerderij7-pannen-w.png" width="548" height="551"/>
 </tile>
 <tile id="240">
  <properties>
    <property name="naam" value="planken-hut1-spanen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x4"/>
    <property name="deur" value="2,4"/>
  </properties>
  <image source="huizen/planken-hut1-spanen-z.png" width="349" height="372"/>
 </tile>
 <tile id="241">
  <properties>
    <property name="naam" value="planken-hut1-spanen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="4x6"/>
    <property name="deur" value="4,3"/>
  </properties>
  <image source="huizen/planken-hut1-spanen-o.png" width="349" height="363"/>
 </tile>
 <tile id="242">
  <properties>
    <property name="naam" value="planken-hut1-spanen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x4"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/planken-hut1-spanen-n.png" width="349" height="363"/>
 </tile>
 <tile id="243">
  <properties>
    <property name="naam" value="planken-hut1-spanen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="4x6"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/planken-hut1-spanen-w.png" width="349" height="374"/>
 </tile>
 <tile id="244">
  <properties>
    <property name="naam" value="planken-hut3-spanen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x4"/>
    <property name="deur" value="3,4"/>
  </properties>
  <image source="huizen/planken-hut3-spanen-z.png" width="380" height="386"/>
 </tile>
 <tile id="245">
  <properties>
    <property name="naam" value="planken-hut3-spanen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="4x6"/>
    <property name="deur" value="4,2"/>
  </properties>
  <image source="huizen/planken-hut3-spanen-o.png" width="380" height="380"/>
 </tile>
 <tile id="246">
  <properties>
    <property name="naam" value="planken-hut3-spanen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x4"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/planken-hut3-spanen-n.png" width="380" height="380"/>
 </tile>
 <tile id="247">
  <properties>
    <property name="naam" value="planken-hut3-spanen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="4x6"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/planken-hut3-spanen-w.png" width="380" height="386"/>
 </tile>
 <tile id="248">
  <properties>
    <property name="naam" value="planken-hut4-spanen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x6"/>
    <property name="deur" value="5,6"/>
  </properties>
  <image source="huizen/planken-hut4-spanen-z.png" width="382" height="415"/>
 </tile>
 <tile id="249">
  <properties>
    <property name="naam" value="planken-hut4-spanen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x6"/>
    <property name="deur" value="6,0"/>
  </properties>
  <image source="huizen/planken-hut4-spanen-o.png" width="449" height="351"/>
 </tile>
 <tile id="250">
  <properties>
    <property name="naam" value="planken-hut4-spanen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x6"/>
    <property name="deur" value="0,-1"/>
  </properties>
  <image source="huizen/planken-hut4-spanen-n.png" width="382" height="419"/>
 </tile>
 <tile id="251">
  <properties>
    <property name="naam" value="planken-hut4-spanen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x6"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/planken-hut4-spanen-w.png" width="449" height="377"/>
 </tile>
 <tile id="252">
  <properties>
    <property name="naam" value="planken-huis7-spanen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-huis7-spanen-z.png" width="555" height="651"/>
 </tile>
 <tile id="253">
  <properties>
    <property name="naam" value="planken-huis7-spanen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-huis7-spanen-o.png" width="555" height="662"/>
 </tile>
 <tile id="254">
  <properties>
    <property name="naam" value="planken-huis7-spanen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-huis7-spanen-n.png" width="555" height="660"/>
 </tile>
 <tile id="255">
  <properties>
    <property name="naam" value="planken-huis7-spanen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-huis7-spanen-w.png" width="555" height="651"/>
 </tile>
 <tile id="256">
  <properties>
    <property name="naam" value="planken-huis7-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-huis7-leien-z.png" width="556" height="669"/>
 </tile>
 <tile id="257">
  <properties>
    <property name="naam" value="planken-huis7-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-huis7-leien-o.png" width="556" height="681"/>
 </tile>
 <tile id="258">
  <properties>
    <property name="naam" value="planken-huis7-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-huis7-leien-n.png" width="556" height="679"/>
 </tile>
 <tile id="259">
  <properties>
    <property name="naam" value="planken-huis7-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-huis7-leien-w.png" width="556" height="669"/>
 </tile>
 <tile id="260">
  <properties>
    <property name="naam" value="planken-huis7-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-huis7-pannen-z.png" width="555" height="629"/>
 </tile>
 <tile id="261">
  <properties>
    <property name="naam" value="planken-huis7-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-huis7-pannen-o.png" width="554" height="641"/>
 </tile>
 <tile id="262">
  <properties>
    <property name="naam" value="planken-huis7-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-huis7-pannen-n.png" width="554" height="639"/>
 </tile>
 <tile id="263">
  <properties>
    <property name="naam" value="planken-huis7-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-huis7-pannen-w.png" width="555" height="629"/>
 </tile>
 <tile id="264">
  <properties>
    <property name="naam" value="planken-steen7-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-steen7-leien-z.png" width="556" height="669"/>
 </tile>
 <tile id="265">
  <properties>
    <property name="naam" value="planken-steen7-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-steen7-leien-o.png" width="556" height="681"/>
 </tile>
 <tile id="266">
  <properties>
    <property name="naam" value="planken-steen7-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-steen7-leien-n.png" width="556" height="679"/>
 </tile>
 <tile id="267">
  <properties>
    <property name="naam" value="planken-steen7-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-steen7-leien-w.png" width="556" height="669"/>
 </tile>
 <tile id="268">
  <properties>
    <property name="naam" value="planken-steen7-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-steen7-pannen-z.png" width="555" height="629"/>
 </tile>
 <tile id="269">
  <properties>
    <property name="naam" value="planken-steen7-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-steen7-pannen-o.png" width="554" height="641"/>
 </tile>
 <tile id="270">
  <properties>
    <property name="naam" value="planken-steen7-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-steen7-pannen-n.png" width="554" height="639"/>
 </tile>
 <tile id="271">
  <properties>
    <property name="naam" value="planken-steen7-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-steen7-pannen-w.png" width="555" height="629"/>
 </tile>
 <tile id="272">
  <properties>
    <property name="naam" value="planken-steen7-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-steen7-baksteen-z.png" width="555" height="629"/>
 </tile>
 <tile id="273">
  <properties>
    <property name="naam" value="planken-steen7-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-steen7-baksteen-o.png" width="554" height="641"/>
 </tile>
 <tile id="274">
  <properties>
    <property name="naam" value="planken-steen7-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-steen7-baksteen-n.png" width="554" height="639"/>
 </tile>
 <tile id="275">
  <properties>
    <property name="naam" value="planken-steen7-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-steen7-baksteen-w.png" width="555" height="629"/>
 </tile>
 <tile id="276">
  <properties>
    <property name="naam" value="planken-huis8-spanen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-huis8-spanen-z.png" width="545" height="576"/>
 </tile>
 <tile id="277">
  <properties>
    <property name="naam" value="planken-huis8-spanen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-huis8-spanen-o.png" width="521" height="600"/>
 </tile>
 <tile id="278">
  <properties>
    <property name="naam" value="planken-huis8-spanen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-huis8-spanen-n.png" width="545" height="530"/>
 </tile>
 <tile id="279">
  <properties>
    <property name="naam" value="planken-huis8-spanen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-huis8-spanen-w.png" width="521" height="610"/>
 </tile>
 <tile id="280">
  <properties>
    <property name="naam" value="planken-huis8-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-huis8-leien-z.png" width="545" height="597"/>
 </tile>
 <tile id="281">
  <properties>
    <property name="naam" value="planken-huis8-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-huis8-leien-o.png" width="525" height="620"/>
 </tile>
 <tile id="282">
  <properties>
    <property name="naam" value="planken-huis8-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-huis8-leien-n.png" width="545" height="552"/>
 </tile>
 <tile id="283">
  <properties>
    <property name="naam" value="planken-huis8-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-huis8-leien-w.png" width="524" height="630"/>
 </tile>
 <tile id="284">
  <properties>
    <property name="naam" value="planken-huis8-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-huis8-pannen-z.png" width="545" height="552"/>
 </tile>
 <tile id="285">
  <properties>
    <property name="naam" value="planken-huis8-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-huis8-pannen-o.png" width="525" height="576"/>
 </tile>
 <tile id="286">
  <properties>
    <property name="naam" value="planken-huis8-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-huis8-pannen-n.png" width="545" height="508"/>
 </tile>
 <tile id="287">
  <properties>
    <property name="naam" value="planken-huis8-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-huis8-pannen-w.png" width="524" height="587"/>
 </tile>
 <tile id="288">
  <properties>
    <property name="naam" value="planken-steen8-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-steen8-leien-z.png" width="545" height="597"/>
 </tile>
 <tile id="289">
  <properties>
    <property name="naam" value="planken-steen8-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-steen8-leien-o.png" width="525" height="620"/>
 </tile>
 <tile id="290">
  <properties>
    <property name="naam" value="planken-steen8-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-steen8-leien-n.png" width="545" height="552"/>
 </tile>
 <tile id="291">
  <properties>
    <property name="naam" value="planken-steen8-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-steen8-leien-w.png" width="524" height="630"/>
 </tile>
 <tile id="292">
  <properties>
    <property name="naam" value="planken-steen8-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-steen8-pannen-z.png" width="545" height="552"/>
 </tile>
 <tile id="293">
  <properties>
    <property name="naam" value="planken-steen8-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-steen8-pannen-o.png" width="525" height="576"/>
 </tile>
 <tile id="294">
  <properties>
    <property name="naam" value="planken-steen8-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-steen8-pannen-n.png" width="545" height="508"/>
 </tile>
 <tile id="295">
  <properties>
    <property name="naam" value="planken-steen8-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-steen8-pannen-w.png" width="524" height="587"/>
 </tile>
 <tile id="296">
  <properties>
    <property name="naam" value="planken-steen8-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-steen8-baksteen-z.png" width="545" height="552"/>
 </tile>
 <tile id="297">
  <properties>
    <property name="naam" value="planken-steen8-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-steen8-baksteen-o.png" width="525" height="576"/>
 </tile>
 <tile id="298">
  <properties>
    <property name="naam" value="planken-steen8-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-steen8-baksteen-n.png" width="545" height="508"/>
 </tile>
 <tile id="299">
  <properties>
    <property name="naam" value="planken-steen8-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-steen8-baksteen-w.png" width="524" height="587"/>
 </tile>
 <tile id="300">
  <properties>
    <property name="naam" value="planken-huis9-spanen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/planken-huis9-spanen-z.png" width="484" height="494"/>
 </tile>
 <tile id="301">
  <properties>
    <property name="naam" value="planken-huis9-spanen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,2"/>
  </properties>
  <image source="huizen/planken-huis9-spanen-o.png" width="522" height="475"/>
 </tile>
 <tile id="302">
  <properties>
    <property name="naam" value="planken-huis9-spanen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/planken-huis9-spanen-n.png" width="484" height="475"/>
 </tile>
 <tile id="303">
  <properties>
    <property name="naam" value="planken-huis9-spanen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/planken-huis9-spanen-w.png" width="522" height="484"/>
 </tile>
 <tile id="304">
  <properties>
    <property name="naam" value="planken-huis9-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/planken-huis9-leien-z.png" width="484" height="511"/>
 </tile>
 <tile id="305">
  <properties>
    <property name="naam" value="planken-huis9-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,2"/>
  </properties>
  <image source="huizen/planken-huis9-leien-o.png" width="522" height="492"/>
 </tile>
 <tile id="306">
  <properties>
    <property name="naam" value="planken-huis9-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/planken-huis9-leien-n.png" width="484" height="492"/>
 </tile>
 <tile id="307">
  <properties>
    <property name="naam" value="planken-huis9-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/planken-huis9-leien-w.png" width="522" height="501"/>
 </tile>
 <tile id="308">
  <properties>
    <property name="naam" value="planken-huis9-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/planken-huis9-pannen-z.png" width="483" height="475"/>
 </tile>
 <tile id="309">
  <properties>
    <property name="naam" value="planken-huis9-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,2"/>
  </properties>
  <image source="huizen/planken-huis9-pannen-o.png" width="522" height="456"/>
 </tile>
 <tile id="310">
  <properties>
    <property name="naam" value="planken-huis9-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/planken-huis9-pannen-n.png" width="483" height="456"/>
 </tile>
 <tile id="311">
  <properties>
    <property name="naam" value="planken-huis9-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/planken-huis9-pannen-w.png" width="522" height="465"/>
 </tile>
 <tile id="312">
  <properties>
    <property name="naam" value="planken-steen9-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/planken-steen9-leien-z.png" width="484" height="511"/>
 </tile>
 <tile id="313">
  <properties>
    <property name="naam" value="planken-steen9-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="7,1"/>
  </properties>
  <image source="huizen/planken-steen9-leien-o.png" width="522" height="492"/>
 </tile>
 <tile id="314">
  <properties>
    <property name="naam" value="planken-steen9-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="1,-1"/>
  </properties>
  <image source="huizen/planken-steen9-leien-n.png" width="484" height="492"/>
 </tile>
 <tile id="315">
  <properties>
    <property name="naam" value="planken-steen9-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/planken-steen9-leien-w.png" width="522" height="494"/>
 </tile>
 <tile id="316">
  <properties>
    <property name="naam" value="planken-steen9-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/planken-steen9-pannen-z.png" width="483" height="474"/>
 </tile>
 <tile id="317">
  <properties>
    <property name="naam" value="planken-steen9-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="7,1"/>
  </properties>
  <image source="huizen/planken-steen9-pannen-o.png" width="522" height="456"/>
 </tile>
 <tile id="318">
  <properties>
    <property name="naam" value="planken-steen9-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="1,-1"/>
  </properties>
  <image source="huizen/planken-steen9-pannen-n.png" width="483" height="456"/>
 </tile>
 <tile id="319">
  <properties>
    <property name="naam" value="planken-steen9-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/planken-steen9-pannen-w.png" width="522" height="458"/>
 </tile>
 <tile id="320">
  <properties>
    <property name="naam" value="planken-steen9-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/planken-steen9-baksteen-z.png" width="483" height="474"/>
 </tile>
 <tile id="321">
  <properties>
    <property name="naam" value="planken-steen9-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="7,1"/>
  </properties>
  <image source="huizen/planken-steen9-baksteen-o.png" width="522" height="456"/>
 </tile>
 <tile id="322">
  <properties>
    <property name="naam" value="planken-steen9-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="1,-1"/>
  </properties>
  <image source="huizen/planken-steen9-baksteen-n.png" width="483" height="456"/>
 </tile>
 <tile id="323">
  <properties>
    <property name="naam" value="planken-steen9-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/planken-steen9-baksteen-w.png" width="522" height="458"/>
 </tile>
 <tile id="324">
  <properties>
    <property name="naam" value="planken-boerderij2-spanen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/planken-boerderij2-spanen-z.png" width="511" height="494"/>
 </tile>
 <tile id="325">
  <properties>
    <property name="naam" value="planken-boerderij2-spanen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,4"/>
  </properties>
  <image source="huizen/planken-boerderij2-spanen-o.png" width="548" height="499"/>
 </tile>
 <tile id="326">
  <properties>
    <property name="naam" value="planken-boerderij2-spanen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-boerderij2-spanen-n.png" width="511" height="523"/>
 </tile>
 <tile id="327">
  <properties>
    <property name="naam" value="planken-boerderij2-spanen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-boerderij2-spanen-w.png" width="548" height="494"/>
 </tile>
 <tile id="328">
  <properties>
    <property name="naam" value="planken-boerderij2-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/planken-boerderij2-leien-z.png" width="511" height="511"/>
 </tile>
 <tile id="329">
  <properties>
    <property name="naam" value="planken-boerderij2-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,4"/>
  </properties>
  <image source="huizen/planken-boerderij2-leien-o.png" width="548" height="516"/>
 </tile>
 <tile id="330">
  <properties>
    <property name="naam" value="planken-boerderij2-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-boerderij2-leien-n.png" width="511" height="540"/>
 </tile>
 <tile id="331">
  <properties>
    <property name="naam" value="planken-boerderij2-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-boerderij2-leien-w.png" width="549" height="511"/>
 </tile>
 <tile id="332">
  <properties>
    <property name="naam" value="planken-boerderij2-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/planken-boerderij2-pannen-z.png" width="511" height="474"/>
 </tile>
 <tile id="333">
  <properties>
    <property name="naam" value="planken-boerderij2-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,4"/>
  </properties>
  <image source="huizen/planken-boerderij2-pannen-o.png" width="548" height="480"/>
 </tile>
 <tile id="334">
  <properties>
    <property name="naam" value="planken-boerderij2-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-boerderij2-pannen-n.png" width="511" height="504"/>
 </tile>
 <tile id="335">
  <properties>
    <property name="naam" value="planken-boerderij2-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-boerderij2-pannen-w.png" width="548" height="474"/>
 </tile>
 <tile id="336">
  <properties>
    <property name="naam" value="planken-boerderij5-spanen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/planken-boerderij5-spanen-z.png" width="513" height="478"/>
 </tile>
 <tile id="337">
  <properties>
    <property name="naam" value="planken-boerderij5-spanen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="6,4"/>
  </properties>
  <image source="huizen/planken-boerderij5-spanen-o.png" width="513" height="476"/>
 </tile>
 <tile id="338">
  <properties>
    <property name="naam" value="planken-boerderij5-spanen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-boerderij5-spanen-n.png" width="513" height="485"/>
 </tile>
 <tile id="339">
  <properties>
    <property name="naam" value="planken-boerderij5-spanen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-boerderij5-spanen-w.png" width="513" height="478"/>
 </tile>
 <tile id="340">
  <properties>
    <property name="naam" value="planken-boerderij5-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/planken-boerderij5-leien-z.png" width="513" height="493"/>
 </tile>
 <tile id="341">
  <properties>
    <property name="naam" value="planken-boerderij5-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="6,4"/>
  </properties>
  <image source="huizen/planken-boerderij5-leien-o.png" width="514" height="490"/>
 </tile>
 <tile id="342">
  <properties>
    <property name="naam" value="planken-boerderij5-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-boerderij5-leien-n.png" width="514" height="499"/>
 </tile>
 <tile id="343">
  <properties>
    <property name="naam" value="planken-boerderij5-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-boerderij5-leien-w.png" width="513" height="493"/>
 </tile>
 <tile id="344">
  <properties>
    <property name="naam" value="planken-boerderij5-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/planken-boerderij5-pannen-z.png" width="513" height="461"/>
 </tile>
 <tile id="345">
  <properties>
    <property name="naam" value="planken-boerderij5-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="6,4"/>
  </properties>
  <image source="huizen/planken-boerderij5-pannen-o.png" width="513" height="459"/>
 </tile>
 <tile id="346">
  <properties>
    <property name="naam" value="planken-boerderij5-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-boerderij5-pannen-n.png" width="513" height="468"/>
 </tile>
 <tile id="347">
  <properties>
    <property name="naam" value="planken-boerderij5-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-boerderij5-pannen-w.png" width="513" height="461"/>
 </tile>
 <tile id="348">
  <properties>
    <property name="naam" value="roze-huis10-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/roze-huis10-riet-z.png" width="526" height="661"/>
 </tile>
 <tile id="349">
  <properties>
    <property name="naam" value="roze-huis10-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/roze-huis10-riet-o.png" width="526" height="651"/>
 </tile>
 <tile id="350">
  <properties>
    <property name="naam" value="roze-huis10-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-huis10-riet-n.png" width="526" height="651"/>
 </tile>
 <tile id="351">
  <properties>
    <property name="naam" value="roze-huis10-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/roze-huis10-riet-w.png" width="526" height="661"/>
 </tile>
 <tile id="352">
  <properties>
    <property name="naam" value="roze-huis10-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/roze-huis10-leien-z.png" width="498" height="624"/>
 </tile>
 <tile id="353">
  <properties>
    <property name="naam" value="roze-huis10-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/roze-huis10-leien-o.png" width="498" height="614"/>
 </tile>
 <tile id="354">
  <properties>
    <property name="naam" value="roze-huis10-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-huis10-leien-n.png" width="498" height="614"/>
 </tile>
 <tile id="355">
  <properties>
    <property name="naam" value="roze-huis10-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/roze-huis10-leien-w.png" width="498" height="624"/>
 </tile>
 <tile id="356">
  <properties>
    <property name="naam" value="roze-huis10-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/roze-huis10-pannen-z.png" width="496" height="590"/>
 </tile>
 <tile id="357">
  <properties>
    <property name="naam" value="roze-huis10-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/roze-huis10-pannen-o.png" width="497" height="580"/>
 </tile>
 <tile id="358">
  <properties>
    <property name="naam" value="roze-huis10-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-huis10-pannen-n.png" width="497" height="580"/>
 </tile>
 <tile id="359">
  <properties>
    <property name="naam" value="roze-huis10-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/roze-huis10-pannen-w.png" width="496" height="590"/>
 </tile>
 <tile id="360">
  <properties>
    <property name="naam" value="roze-steen10-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/roze-steen10-leien-z.png" width="498" height="624"/>
 </tile>
 <tile id="361">
  <properties>
    <property name="naam" value="roze-steen10-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/roze-steen10-leien-o.png" width="498" height="614"/>
 </tile>
 <tile id="362">
  <properties>
    <property name="naam" value="roze-steen10-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-steen10-leien-n.png" width="498" height="614"/>
 </tile>
 <tile id="363">
  <properties>
    <property name="naam" value="roze-steen10-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/roze-steen10-leien-w.png" width="498" height="624"/>
 </tile>
 <tile id="364">
  <properties>
    <property name="naam" value="roze-steen10-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/roze-steen10-pannen-z.png" width="496" height="590"/>
 </tile>
 <tile id="365">
  <properties>
    <property name="naam" value="roze-steen10-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/roze-steen10-pannen-o.png" width="497" height="580"/>
 </tile>
 <tile id="366">
  <properties>
    <property name="naam" value="roze-steen10-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-steen10-pannen-n.png" width="497" height="580"/>
 </tile>
 <tile id="367">
  <properties>
    <property name="naam" value="roze-steen10-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/roze-steen10-pannen-w.png" width="496" height="590"/>
 </tile>
 <tile id="368">
  <properties>
    <property name="naam" value="roze-steen10-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/roze-steen10-baksteen-z.png" width="496" height="590"/>
 </tile>
 <tile id="369">
  <properties>
    <property name="naam" value="roze-steen10-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/roze-steen10-baksteen-o.png" width="497" height="580"/>
 </tile>
 <tile id="370">
  <properties>
    <property name="naam" value="roze-steen10-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-steen10-baksteen-n.png" width="497" height="580"/>
 </tile>
 <tile id="371">
  <properties>
    <property name="naam" value="roze-steen10-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/roze-steen10-baksteen-w.png" width="496" height="590"/>
 </tile>
 <tile id="372">
  <properties>
    <property name="naam" value="roze-huis11-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,6"/>
  </properties>
  <image source="huizen/roze-huis11-riet-z.png" width="546" height="565"/>
 </tile>
 <tile id="373">
  <properties>
    <property name="naam" value="roze-huis11-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,4"/>
  </properties>
  <image source="huizen/roze-huis11-riet-o.png" width="546" height="559"/>
 </tile>
 <tile id="374">
  <properties>
    <property name="naam" value="roze-huis11-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-huis11-riet-n.png" width="546" height="559"/>
 </tile>
 <tile id="375">
  <properties>
    <property name="naam" value="roze-huis11-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/roze-huis11-riet-w.png" width="546" height="565"/>
 </tile>
 <tile id="376">
  <properties>
    <property name="naam" value="roze-huis11-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,6"/>
  </properties>
  <image source="huizen/roze-huis11-leien-z.png" width="511" height="530"/>
 </tile>
 <tile id="377">
  <properties>
    <property name="naam" value="roze-huis11-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,4"/>
  </properties>
  <image source="huizen/roze-huis11-leien-o.png" width="511" height="525"/>
 </tile>
 <tile id="378">
  <properties>
    <property name="naam" value="roze-huis11-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-huis11-leien-n.png" width="511" height="525"/>
 </tile>
 <tile id="379">
  <properties>
    <property name="naam" value="roze-huis11-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/roze-huis11-leien-w.png" width="511" height="530"/>
 </tile>
 <tile id="380">
  <properties>
    <property name="naam" value="roze-huis11-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,6"/>
  </properties>
  <image source="huizen/roze-huis11-pannen-z.png" width="509" height="488"/>
 </tile>
 <tile id="381">
  <properties>
    <property name="naam" value="roze-huis11-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,4"/>
  </properties>
  <image source="huizen/roze-huis11-pannen-o.png" width="509" height="483"/>
 </tile>
 <tile id="382">
  <properties>
    <property name="naam" value="roze-huis11-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-huis11-pannen-n.png" width="509" height="483"/>
 </tile>
 <tile id="383">
  <properties>
    <property name="naam" value="roze-huis11-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/roze-huis11-pannen-w.png" width="509" height="488"/>
 </tile>
 <tile id="384">
  <properties>
    <property name="naam" value="roze-steen11-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,6"/>
  </properties>
  <image source="huizen/roze-steen11-leien-z.png" width="511" height="530"/>
 </tile>
 <tile id="385">
  <properties>
    <property name="naam" value="roze-steen11-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,4"/>
  </properties>
  <image source="huizen/roze-steen11-leien-o.png" width="511" height="525"/>
 </tile>
 <tile id="386">
  <properties>
    <property name="naam" value="roze-steen11-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-steen11-leien-n.png" width="511" height="525"/>
 </tile>
 <tile id="387">
  <properties>
    <property name="naam" value="roze-steen11-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/roze-steen11-leien-w.png" width="511" height="530"/>
 </tile>
 <tile id="388">
  <properties>
    <property name="naam" value="roze-steen11-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,6"/>
  </properties>
  <image source="huizen/roze-steen11-pannen-z.png" width="509" height="488"/>
 </tile>
 <tile id="389">
  <properties>
    <property name="naam" value="roze-steen11-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,4"/>
  </properties>
  <image source="huizen/roze-steen11-pannen-o.png" width="509" height="483"/>
 </tile>
 <tile id="390">
  <properties>
    <property name="naam" value="roze-steen11-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-steen11-pannen-n.png" width="509" height="483"/>
 </tile>
 <tile id="391">
  <properties>
    <property name="naam" value="roze-steen11-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/roze-steen11-pannen-w.png" width="509" height="488"/>
 </tile>
 <tile id="392">
  <properties>
    <property name="naam" value="roze-steen11-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,6"/>
  </properties>
  <image source="huizen/roze-steen11-baksteen-z.png" width="509" height="488"/>
 </tile>
 <tile id="393">
  <properties>
    <property name="naam" value="roze-steen11-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,4"/>
  </properties>
  <image source="huizen/roze-steen11-baksteen-o.png" width="509" height="483"/>
 </tile>
 <tile id="394">
  <properties>
    <property name="naam" value="roze-steen11-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-steen11-baksteen-n.png" width="509" height="483"/>
 </tile>
 <tile id="395">
  <properties>
    <property name="naam" value="roze-steen11-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/roze-steen11-baksteen-w.png" width="509" height="488"/>
 </tile>
 <tile id="396">
  <properties>
    <property name="naam" value="roze-huis12-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/roze-huis12-riet-z.png" width="546" height="620"/>
 </tile>
 <tile id="397">
  <properties>
    <property name="naam" value="roze-huis12-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,4"/>
  </properties>
  <image source="huizen/roze-huis12-riet-o.png" width="598" height="608"/>
 </tile>
 <tile id="398">
  <properties>
    <property name="naam" value="roze-huis12-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-huis12-riet-n.png" width="546" height="634"/>
 </tile>
 <tile id="399">
  <properties>
    <property name="naam" value="roze-huis12-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-huis12-riet-w.png" width="598" height="603"/>
 </tile>
 <tile id="400">
  <properties>
    <property name="naam" value="roze-huis12-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/roze-huis12-leien-z.png" width="512" height="581"/>
 </tile>
 <tile id="401">
  <properties>
    <property name="naam" value="roze-huis12-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,4"/>
  </properties>
  <image source="huizen/roze-huis12-leien-o.png" width="564" height="572"/>
 </tile>
 <tile id="402">
  <properties>
    <property name="naam" value="roze-huis12-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-huis12-leien-n.png" width="512" height="611"/>
 </tile>
 <tile id="403">
  <properties>
    <property name="naam" value="roze-huis12-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-huis12-leien-w.png" width="564" height="567"/>
 </tile>
 <tile id="404">
  <properties>
    <property name="naam" value="roze-huis12-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/roze-huis12-pannen-z.png" width="511" height="551"/>
 </tile>
 <tile id="405">
  <properties>
    <property name="naam" value="roze-huis12-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,4"/>
  </properties>
  <image source="huizen/roze-huis12-pannen-o.png" width="564" height="536"/>
 </tile>
 <tile id="406">
  <properties>
    <property name="naam" value="roze-huis12-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-huis12-pannen-n.png" width="511" height="575"/>
 </tile>
 <tile id="407">
  <properties>
    <property name="naam" value="roze-huis12-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-huis12-pannen-w.png" width="564" height="530"/>
 </tile>
 <tile id="408">
  <properties>
    <property name="naam" value="roze-steen12-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/roze-steen12-leien-z.png" width="512" height="581"/>
 </tile>
 <tile id="409">
  <properties>
    <property name="naam" value="roze-steen12-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,4"/>
  </properties>
  <image source="huizen/roze-steen12-leien-o.png" width="564" height="572"/>
 </tile>
 <tile id="410">
  <properties>
    <property name="naam" value="roze-steen12-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-steen12-leien-n.png" width="512" height="611"/>
 </tile>
 <tile id="411">
  <properties>
    <property name="naam" value="roze-steen12-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-steen12-leien-w.png" width="564" height="567"/>
 </tile>
 <tile id="412">
  <properties>
    <property name="naam" value="roze-steen12-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/roze-steen12-pannen-z.png" width="511" height="551"/>
 </tile>
 <tile id="413">
  <properties>
    <property name="naam" value="roze-steen12-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,4"/>
  </properties>
  <image source="huizen/roze-steen12-pannen-o.png" width="564" height="536"/>
 </tile>
 <tile id="414">
  <properties>
    <property name="naam" value="roze-steen12-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-steen12-pannen-n.png" width="511" height="575"/>
 </tile>
 <tile id="415">
  <properties>
    <property name="naam" value="roze-steen12-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-steen12-pannen-w.png" width="564" height="530"/>
 </tile>
 <tile id="416">
  <properties>
    <property name="naam" value="roze-steen12-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/roze-steen12-baksteen-z.png" width="511" height="551"/>
 </tile>
 <tile id="417">
  <properties>
    <property name="naam" value="roze-steen12-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,4"/>
  </properties>
  <image source="huizen/roze-steen12-baksteen-o.png" width="564" height="536"/>
 </tile>
 <tile id="418">
  <properties>
    <property name="naam" value="roze-steen12-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-steen12-baksteen-n.png" width="511" height="575"/>
 </tile>
 <tile id="419">
  <properties>
    <property name="naam" value="roze-steen12-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-steen12-baksteen-w.png" width="564" height="530"/>
 </tile>
 <tile id="420">
  <properties>
    <property name="naam" value="roze-boerderij8-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/roze-boerderij8-riet-z.png" width="546" height="576"/>
 </tile>
 <tile id="421">
  <properties>
    <property name="naam" value="roze-boerderij8-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/roze-boerderij8-riet-o.png" width="608" height="538"/>
 </tile>
 <tile id="422">
  <properties>
    <property name="naam" value="roze-boerderij8-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-boerderij8-riet-n.png" width="546" height="568"/>
 </tile>
 <tile id="423">
  <properties>
    <property name="naam" value="roze-boerderij8-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-boerderij8-riet-w.png" width="608" height="497"/>
 </tile>
 <tile id="424">
  <properties>
    <property name="naam" value="roze-boerderij8-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/roze-boerderij8-leien-z.png" width="523" height="538"/>
 </tile>
 <tile id="425">
  <properties>
    <property name="naam" value="roze-boerderij8-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/roze-boerderij8-leien-o.png" width="577" height="500"/>
 </tile>
 <tile id="426">
  <properties>
    <property name="naam" value="roze-boerderij8-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-boerderij8-leien-n.png" width="523" height="530"/>
 </tile>
 <tile id="427">
  <properties>
    <property name="naam" value="roze-boerderij8-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-boerderij8-leien-w.png" width="577" height="469"/>
 </tile>
 <tile id="428">
  <properties>
    <property name="naam" value="roze-boerderij8-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/roze-boerderij8-pannen-z.png" width="523" height="505"/>
 </tile>
 <tile id="429">
  <properties>
    <property name="naam" value="roze-boerderij8-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/roze-boerderij8-pannen-o.png" width="576" height="467"/>
 </tile>
 <tile id="430">
  <properties>
    <property name="naam" value="roze-boerderij8-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-boerderij8-pannen-n.png" width="523" height="497"/>
 </tile>
 <tile id="431">
  <properties>
    <property name="naam" value="roze-boerderij8-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-boerderij8-pannen-w.png" width="576" height="436"/>
 </tile>
 <tile id="432">
  <properties>
    <property name="naam" value="roze-boerderij9-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/roze-boerderij9-riet-z.png" width="610" height="650"/>
 </tile>
 <tile id="433">
  <properties>
    <property name="naam" value="roze-boerderij9-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x10"/>
    <property name="deur" value="6,5"/>
  </properties>
  <image source="huizen/roze-boerderij9-riet-o.png" width="610" height="655"/>
 </tile>
 <tile id="434">
  <properties>
    <property name="naam" value="roze-boerderij9-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x6"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/roze-boerderij9-riet-n.png" width="610" height="655"/>
 </tile>
 <tile id="435">
  <properties>
    <property name="naam" value="roze-boerderij9-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x10"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-boerderij9-riet-w.png" width="610" height="650"/>
 </tile>
 <tile id="436">
  <properties>
    <property name="naam" value="roze-boerderij9-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/roze-boerderij9-leien-z.png" width="578" height="616"/>
 </tile>
 <tile id="437">
  <properties>
    <property name="naam" value="roze-boerderij9-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x10"/>
    <property name="deur" value="6,5"/>
  </properties>
  <image source="huizen/roze-boerderij9-leien-o.png" width="578" height="621"/>
 </tile>
 <tile id="438">
  <properties>
    <property name="naam" value="roze-boerderij9-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x6"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/roze-boerderij9-leien-n.png" width="578" height="621"/>
 </tile>
 <tile id="439">
  <properties>
    <property name="naam" value="roze-boerderij9-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x10"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-boerderij9-leien-w.png" width="578" height="616"/>
 </tile>
 <tile id="440">
  <properties>
    <property name="naam" value="roze-boerderij9-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/roze-boerderij9-pannen-z.png" width="578" height="574"/>
 </tile>
 <tile id="441">
  <properties>
    <property name="naam" value="roze-boerderij9-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x10"/>
    <property name="deur" value="6,5"/>
  </properties>
  <image source="huizen/roze-boerderij9-pannen-o.png" width="577" height="579"/>
 </tile>
 <tile id="442">
  <properties>
    <property name="naam" value="roze-boerderij9-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x6"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/roze-boerderij9-pannen-n.png" width="577" height="579"/>
 </tile>
 <tile id="443">
  <properties>
    <property name="naam" value="roze-boerderij9-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x10"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-boerderij9-pannen-w.png" width="578" height="574"/>
 </tile>
 <tile id="444">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="445">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="446">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="447">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="448">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="449">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="450">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="451">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="452">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="453">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="454">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="455">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="456">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="457">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="458">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="459">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="460">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="461">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="462">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="463">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="464">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="465">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="466">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="467">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="468">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="469">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="470">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="471">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="472">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="473">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="474">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="475">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="476">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="477">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="478">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="479">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="480">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="481">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="482">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="483">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="484">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="485">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="486">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="487">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="488">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="489">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="490">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="491">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="492">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="493">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="494">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="495">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="496">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="497">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="498">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="499">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="500">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="501">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="502">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="503">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="504">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="505">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="506">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="507">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="508">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="509">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="510">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="511">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
</tileset>
