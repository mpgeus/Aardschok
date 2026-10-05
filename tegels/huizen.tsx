<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.10" tiledversion="1.11.0" name="huizen" tilewidth="608" tileheight="709" tilecount="152" columns="0" objectalignment="bottom">
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
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="145">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="146">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="147">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="148">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="149">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="150">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="151">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
</tileset>
