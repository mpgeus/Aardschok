<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.10" tiledversion="1.11.0" name="huizen" tilewidth="771" tileheight="1295" tilecount="1280" columns="0" objectalignment="bottom">
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
  <image source="huizen/hut1.png" width="382" height="411"/>
 </tile>
 <tile id="1">
  <properties>
    <property name="naam" value="hut2"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="4x5"/>
    <property name="deur" value="4,2"/>
  </properties>
  <image source="huizen/hut2.png" width="382" height="400"/>
 </tile>
 <tile id="2">
  <properties>
    <property name="naam" value="hut3"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x4"/>
    <property name="deur" value="2,4"/>
  </properties>
  <image source="huizen/hut3.png" width="413" height="424"/>
 </tile>
 <tile id="3">
  <properties>
    <property name="naam" value="hut4"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x6"/>
    <property name="deur" value="2,6"/>
  </properties>
  <image source="huizen/hut4.png" width="415" height="446"/>
 </tile>
 <tile id="4">
  <properties>
    <property name="naam" value="huis1"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/huis1.png" width="478" height="558"/>
 </tile>
 <tile id="5">
  <properties>
    <property name="naam" value="huis2"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,2"/>
  </properties>
  <image source="huizen/huis2.png" width="479" height="614"/>
 </tile>
 <tile id="6">
  <properties>
    <property name="naam" value="huis3"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/huis3.png" width="511" height="569"/>
 </tile>
 <tile id="7">
  <properties>
    <property name="naam" value="huis4"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="3,8"/>
  </properties>
  <image source="huizen/huis4.png" width="514" height="610"/>
 </tile>
 <tile id="8">
  <properties>
    <property name="naam" value="huis5"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,5"/>
  </properties>
  <image source="huizen/huis5.png" width="446" height="575"/>
 </tile>
 <tile id="9">
  <properties>
    <property name="naam" value="huis6"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="2,9"/>
  </properties>
  <image source="huizen/huis6.png" width="550" height="580"/>
 </tile>
 <tile id="10">
  <properties>
    <property name="naam" value="boerderij1"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,3"/>
  </properties>
  <image source="huizen/boerderij1.png" width="609" height="579"/>
 </tile>
 <tile id="11">
  <properties>
    <property name="naam" value="boerderij2"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="5,8"/>
  </properties>
  <image source="huizen/boerderij2.png" width="543" height="579"/>
 </tile>
 <tile id="12">
  <properties>
    <property name="naam" value="boerderij3"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/boerderij3.png" width="575" height="687"/>
 </tile>
 <tile id="13">
  <properties>
    <property name="naam" value="boerderij4"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/boerderij4.png" width="544" height="608"/>
 </tile>
 <tile id="14">
  <properties>
    <property name="naam" value="boerderij5"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="6,4"/>
  </properties>
  <image source="huizen/boerderij5.png" width="508" height="520"/>
 </tile>
 <tile id="15">
  <properties>
    <property name="naam" value="schoutshuis"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/schoutshuis.png" width="585" height="765"/>
 </tile>
 <tile id="16">
  <properties>
    <property name="naam" value="herberg1"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x11"/>
    <property name="deur" value="8,5"/>
  </properties>
  <image source="huizen/herberg1.png" width="606" height="613"/>
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
  <image source="huizen/steen1.png" width="478" height="558"/>
 </tile>
 <tile id="25">
  <properties>
    <property name="naam" value="steen2"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,2"/>
  </properties>
  <image source="huizen/steen2.png" width="479" height="614"/>
 </tile>
 <tile id="26">
  <properties>
    <property name="naam" value="steen3"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="8,2"/>
  </properties>
  <image source="huizen/steen3.png" width="511" height="569"/>
 </tile>
 <tile id="27">
  <properties>
    <property name="naam" value="steen4"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="3,8"/>
  </properties>
  <image source="huizen/steen4.png" width="514" height="610"/>
 </tile>
 <tile id="28">
  <properties>
    <property name="naam" value="steen5"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,5"/>
  </properties>
  <image source="huizen/steen5.png" width="446" height="575"/>
 </tile>
 <tile id="29">
  <properties>
    <property name="naam" value="steen6"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="2,9"/>
  </properties>
  <image source="huizen/steen6.png" width="550" height="580"/>
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
  <image source="huizen/wit-huis1-riet-z.png" width="482" height="573"/>
 </tile>
 <tile id="45">
  <properties>
    <property name="naam" value="wit-huis1-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/wit-huis1-riet-o.png" width="482" height="575"/>
 </tile>
 <tile id="46">
  <properties>
    <property name="naam" value="wit-huis1-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/wit-huis1-riet-n.png" width="482" height="575"/>
 </tile>
 <tile id="47">
  <properties>
    <property name="naam" value="wit-huis1-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/wit-huis1-riet-w.png" width="482" height="573"/>
 </tile>
 <tile id="48">
  <properties>
    <property name="naam" value="wit-huis1-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/wit-huis1-leien-z.png" width="447" height="525"/>
 </tile>
 <tile id="49">
  <properties>
    <property name="naam" value="wit-huis1-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/wit-huis1-leien-o.png" width="447" height="527"/>
 </tile>
 <tile id="50">
  <properties>
    <property name="naam" value="wit-huis1-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/wit-huis1-leien-n.png" width="447" height="527"/>
 </tile>
 <tile id="51">
  <properties>
    <property name="naam" value="wit-huis1-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/wit-huis1-leien-w.png" width="447" height="531"/>
 </tile>
 <tile id="52">
  <properties>
    <property name="naam" value="wit-huis1-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/wit-huis1-pannen-z.png" width="447" height="525"/>
 </tile>
 <tile id="53">
  <properties>
    <property name="naam" value="wit-huis1-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/wit-huis1-pannen-o.png" width="447" height="527"/>
 </tile>
 <tile id="54">
  <properties>
    <property name="naam" value="wit-huis1-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/wit-huis1-pannen-n.png" width="447" height="527"/>
 </tile>
 <tile id="55">
  <properties>
    <property name="naam" value="wit-huis1-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/wit-huis1-pannen-w.png" width="447" height="531"/>
 </tile>
 <tile id="56">
  <properties>
    <property name="naam" value="wit-steen1-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/wit-steen1-leien-z.png" width="447" height="525"/>
 </tile>
 <tile id="57">
  <properties>
    <property name="naam" value="wit-steen1-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/wit-steen1-leien-o.png" width="447" height="527"/>
 </tile>
 <tile id="58">
  <properties>
    <property name="naam" value="wit-steen1-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/wit-steen1-leien-n.png" width="447" height="527"/>
 </tile>
 <tile id="59">
  <properties>
    <property name="naam" value="wit-steen1-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/wit-steen1-leien-w.png" width="447" height="531"/>
 </tile>
 <tile id="60">
  <properties>
    <property name="naam" value="wit-steen1-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/wit-steen1-pannen-z.png" width="447" height="525"/>
 </tile>
 <tile id="61">
  <properties>
    <property name="naam" value="wit-steen1-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/wit-steen1-pannen-o.png" width="447" height="527"/>
 </tile>
 <tile id="62">
  <properties>
    <property name="naam" value="wit-steen1-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/wit-steen1-pannen-n.png" width="447" height="527"/>
 </tile>
 <tile id="63">
  <properties>
    <property name="naam" value="wit-steen1-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/wit-steen1-pannen-w.png" width="447" height="531"/>
 </tile>
 <tile id="64">
  <properties>
    <property name="naam" value="wit-steen1-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/wit-steen1-baksteen-z.png" width="447" height="525"/>
 </tile>
 <tile id="65">
  <properties>
    <property name="naam" value="wit-steen1-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/wit-steen1-baksteen-o.png" width="447" height="527"/>
 </tile>
 <tile id="66">
  <properties>
    <property name="naam" value="wit-steen1-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/wit-steen1-baksteen-n.png" width="447" height="527"/>
 </tile>
 <tile id="67">
  <properties>
    <property name="naam" value="wit-steen1-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/wit-steen1-baksteen-w.png" width="447" height="531"/>
 </tile>
 <tile id="68">
  <properties>
    <property name="naam" value="wit-huis3-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/wit-huis3-riet-z.png" width="514" height="584"/>
 </tile>
 <tile id="69">
  <properties>
    <property name="naam" value="wit-huis3-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,2"/>
  </properties>
  <image source="huizen/wit-huis3-riet-o.png" width="539" height="560"/>
 </tile>
 <tile id="70">
  <properties>
    <property name="naam" value="wit-huis3-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/wit-huis3-riet-n.png" width="514" height="560"/>
 </tile>
 <tile id="71">
  <properties>
    <property name="naam" value="wit-huis3-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/wit-huis3-riet-w.png" width="540" height="558"/>
 </tile>
 <tile id="72">
  <properties>
    <property name="naam" value="wit-huis3-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/wit-huis3-leien-z.png" width="481" height="536"/>
 </tile>
 <tile id="73">
  <properties>
    <property name="naam" value="wit-huis3-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,2"/>
  </properties>
  <image source="huizen/wit-huis3-leien-o.png" width="521" height="513"/>
 </tile>
 <tile id="74">
  <properties>
    <property name="naam" value="wit-huis3-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/wit-huis3-leien-n.png" width="481" height="513"/>
 </tile>
 <tile id="75">
  <properties>
    <property name="naam" value="wit-huis3-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/wit-huis3-leien-w.png" width="521" height="510"/>
 </tile>
 <tile id="76">
  <properties>
    <property name="naam" value="wit-huis3-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/wit-huis3-pannen-z.png" width="481" height="536"/>
 </tile>
 <tile id="77">
  <properties>
    <property name="naam" value="wit-huis3-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,2"/>
  </properties>
  <image source="huizen/wit-huis3-pannen-o.png" width="521" height="513"/>
 </tile>
 <tile id="78">
  <properties>
    <property name="naam" value="wit-huis3-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/wit-huis3-pannen-n.png" width="481" height="513"/>
 </tile>
 <tile id="79">
  <properties>
    <property name="naam" value="wit-huis3-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/wit-huis3-pannen-w.png" width="521" height="510"/>
 </tile>
 <tile id="80">
  <properties>
    <property name="naam" value="wit-steen3-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/wit-steen3-leien-z.png" width="481" height="536"/>
 </tile>
 <tile id="81">
  <properties>
    <property name="naam" value="wit-steen3-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="7,1"/>
  </properties>
  <image source="huizen/wit-steen3-leien-o.png" width="521" height="513"/>
 </tile>
 <tile id="82">
  <properties>
    <property name="naam" value="wit-steen3-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="1,-1"/>
  </properties>
  <image source="huizen/wit-steen3-leien-n.png" width="481" height="513"/>
 </tile>
 <tile id="83">
  <properties>
    <property name="naam" value="wit-steen3-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/wit-steen3-leien-w.png" width="521" height="510"/>
 </tile>
 <tile id="84">
  <properties>
    <property name="naam" value="wit-steen3-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/wit-steen3-pannen-z.png" width="481" height="536"/>
 </tile>
 <tile id="85">
  <properties>
    <property name="naam" value="wit-steen3-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="7,1"/>
  </properties>
  <image source="huizen/wit-steen3-pannen-o.png" width="521" height="513"/>
 </tile>
 <tile id="86">
  <properties>
    <property name="naam" value="wit-steen3-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="1,-1"/>
  </properties>
  <image source="huizen/wit-steen3-pannen-n.png" width="481" height="513"/>
 </tile>
 <tile id="87">
  <properties>
    <property name="naam" value="wit-steen3-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/wit-steen3-pannen-w.png" width="521" height="510"/>
 </tile>
 <tile id="88">
  <properties>
    <property name="naam" value="wit-steen3-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/wit-steen3-baksteen-z.png" width="481" height="536"/>
 </tile>
 <tile id="89">
  <properties>
    <property name="naam" value="wit-steen3-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="7,1"/>
  </properties>
  <image source="huizen/wit-steen3-baksteen-o.png" width="521" height="513"/>
 </tile>
 <tile id="90">
  <properties>
    <property name="naam" value="wit-steen3-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="1,-1"/>
  </properties>
  <image source="huizen/wit-steen3-baksteen-n.png" width="481" height="513"/>
 </tile>
 <tile id="91">
  <properties>
    <property name="naam" value="wit-steen3-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/wit-steen3-baksteen-w.png" width="521" height="510"/>
 </tile>
 <tile id="92">
  <properties>
    <property name="naam" value="wit-huis6-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="5,8"/>
  </properties>
  <image source="huizen/wit-huis6-riet-z.png" width="546" height="589"/>
 </tile>
 <tile id="93">
  <properties>
    <property name="naam" value="wit-huis6-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/wit-huis6-riet-o.png" width="582" height="573"/>
 </tile>
 <tile id="94">
  <properties>
    <property name="naam" value="wit-huis6-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/wit-huis6-riet-n.png" width="546" height="573"/>
 </tile>
 <tile id="95">
  <properties>
    <property name="naam" value="wit-huis6-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/wit-huis6-riet-w.png" width="582" height="590"/>
 </tile>
 <tile id="96">
  <properties>
    <property name="naam" value="wit-huis6-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="5,8"/>
  </properties>
  <image source="huizen/wit-huis6-leien-z.png" width="516" height="552"/>
 </tile>
 <tile id="97">
  <properties>
    <property name="naam" value="wit-huis6-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/wit-huis6-leien-o.png" width="550" height="525"/>
 </tile>
 <tile id="98">
  <properties>
    <property name="naam" value="wit-huis6-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/wit-huis6-leien-n.png" width="516" height="525"/>
 </tile>
 <tile id="99">
  <properties>
    <property name="naam" value="wit-huis6-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/wit-huis6-leien-w.png" width="550" height="557"/>
 </tile>
 <tile id="100">
  <properties>
    <property name="naam" value="wit-huis6-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="5,8"/>
  </properties>
  <image source="huizen/wit-huis6-pannen-z.png" width="516" height="552"/>
 </tile>
 <tile id="101">
  <properties>
    <property name="naam" value="wit-huis6-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/wit-huis6-pannen-o.png" width="550" height="525"/>
 </tile>
 <tile id="102">
  <properties>
    <property name="naam" value="wit-huis6-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/wit-huis6-pannen-n.png" width="516" height="525"/>
 </tile>
 <tile id="103">
  <properties>
    <property name="naam" value="wit-huis6-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/wit-huis6-pannen-w.png" width="550" height="557"/>
 </tile>
 <tile id="104">
  <properties>
    <property name="naam" value="wit-steen6-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="5,8"/>
  </properties>
  <image source="huizen/wit-steen6-leien-z.png" width="516" height="552"/>
 </tile>
 <tile id="105">
  <properties>
    <property name="naam" value="wit-steen6-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/wit-steen6-leien-o.png" width="550" height="525"/>
 </tile>
 <tile id="106">
  <properties>
    <property name="naam" value="wit-steen6-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/wit-steen6-leien-n.png" width="516" height="525"/>
 </tile>
 <tile id="107">
  <properties>
    <property name="naam" value="wit-steen6-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/wit-steen6-leien-w.png" width="550" height="557"/>
 </tile>
 <tile id="108">
  <properties>
    <property name="naam" value="wit-steen6-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="5,8"/>
  </properties>
  <image source="huizen/wit-steen6-pannen-z.png" width="516" height="552"/>
 </tile>
 <tile id="109">
  <properties>
    <property name="naam" value="wit-steen6-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/wit-steen6-pannen-o.png" width="550" height="525"/>
 </tile>
 <tile id="110">
  <properties>
    <property name="naam" value="wit-steen6-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/wit-steen6-pannen-n.png" width="516" height="525"/>
 </tile>
 <tile id="111">
  <properties>
    <property name="naam" value="wit-steen6-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/wit-steen6-pannen-w.png" width="550" height="557"/>
 </tile>
 <tile id="112">
  <properties>
    <property name="naam" value="wit-steen6-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="5,8"/>
  </properties>
  <image source="huizen/wit-steen6-baksteen-z.png" width="516" height="552"/>
 </tile>
 <tile id="113">
  <properties>
    <property name="naam" value="wit-steen6-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/wit-steen6-baksteen-o.png" width="550" height="525"/>
 </tile>
 <tile id="114">
  <properties>
    <property name="naam" value="wit-steen6-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/wit-steen6-baksteen-n.png" width="516" height="525"/>
 </tile>
 <tile id="115">
  <properties>
    <property name="naam" value="wit-steen6-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/wit-steen6-baksteen-w.png" width="550" height="557"/>
 </tile>
 <tile id="116">
  <properties>
    <property name="naam" value="wit-boerderij1-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/wit-boerderij1-riet-z.png" width="608" height="594"/>
 </tile>
 <tile id="117">
  <properties>
    <property name="naam" value="wit-boerderij1-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/wit-boerderij1-riet-o.png" width="546" height="632"/>
 </tile>
 <tile id="118">
  <properties>
    <property name="naam" value="wit-boerderij1-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/wit-boerderij1-riet-n.png" width="608" height="552"/>
 </tile>
 <tile id="119">
  <properties>
    <property name="naam" value="wit-boerderij1-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/wit-boerderij1-riet-w.png" width="546" height="624"/>
 </tile>
 <tile id="120">
  <properties>
    <property name="naam" value="wit-boerderij1-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/wit-boerderij1-leien-z.png" width="574" height="546"/>
 </tile>
 <tile id="121">
  <properties>
    <property name="naam" value="wit-boerderij1-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/wit-boerderij1-leien-o.png" width="521" height="584"/>
 </tile>
 <tile id="122">
  <properties>
    <property name="naam" value="wit-boerderij1-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/wit-boerderij1-leien-n.png" width="574" height="513"/>
 </tile>
 <tile id="123">
  <properties>
    <property name="naam" value="wit-boerderij1-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/wit-boerderij1-leien-w.png" width="522" height="576"/>
 </tile>
 <tile id="124">
  <properties>
    <property name="naam" value="wit-boerderij1-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/wit-boerderij1-pannen-z.png" width="574" height="546"/>
 </tile>
 <tile id="125">
  <properties>
    <property name="naam" value="wit-boerderij1-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/wit-boerderij1-pannen-o.png" width="522" height="584"/>
 </tile>
 <tile id="126">
  <properties>
    <property name="naam" value="wit-boerderij1-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/wit-boerderij1-pannen-n.png" width="574" height="514"/>
 </tile>
 <tile id="127">
  <properties>
    <property name="naam" value="wit-boerderij1-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/wit-boerderij1-pannen-w.png" width="523" height="576"/>
 </tile>
 <tile id="128">
  <properties>
    <property name="naam" value="wit-boerderij4-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/wit-boerderij4-riet-z.png" width="546" height="622"/>
 </tile>
 <tile id="129">
  <properties>
    <property name="naam" value="wit-boerderij4-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,3"/>
  </properties>
  <image source="huizen/wit-boerderij4-riet-o.png" width="546" height="633"/>
 </tile>
 <tile id="130">
  <properties>
    <property name="naam" value="wit-boerderij4-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/wit-boerderij4-riet-n.png" width="546" height="633"/>
 </tile>
 <tile id="131">
  <properties>
    <property name="naam" value="wit-boerderij4-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/wit-boerderij4-riet-w.png" width="546" height="622"/>
 </tile>
 <tile id="132">
  <properties>
    <property name="naam" value="wit-boerderij4-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/wit-boerderij4-leien-z.png" width="518" height="575"/>
 </tile>
 <tile id="133">
  <properties>
    <property name="naam" value="wit-boerderij4-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,3"/>
  </properties>
  <image source="huizen/wit-boerderij4-leien-o.png" width="518" height="586"/>
 </tile>
 <tile id="134">
  <properties>
    <property name="naam" value="wit-boerderij4-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/wit-boerderij4-leien-n.png" width="518" height="586"/>
 </tile>
 <tile id="135">
  <properties>
    <property name="naam" value="wit-boerderij4-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/wit-boerderij4-leien-w.png" width="518" height="575"/>
 </tile>
 <tile id="136">
  <properties>
    <property name="naam" value="wit-boerderij4-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/wit-boerderij4-pannen-z.png" width="518" height="575"/>
 </tile>
 <tile id="137">
  <properties>
    <property name="naam" value="wit-boerderij4-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,3"/>
  </properties>
  <image source="huizen/wit-boerderij4-pannen-o.png" width="518" height="586"/>
 </tile>
 <tile id="138">
  <properties>
    <property name="naam" value="wit-boerderij4-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/wit-boerderij4-pannen-n.png" width="518" height="586"/>
 </tile>
 <tile id="139">
  <properties>
    <property name="naam" value="wit-boerderij4-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/wit-boerderij4-pannen-w.png" width="518" height="575"/>
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
  <image source="huizen/oker-huis2-riet-z.png" width="482" height="628"/>
 </tile>
 <tile id="145">
  <properties>
    <property name="naam" value="oker-huis2-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/oker-huis2-riet-o.png" width="482" height="633"/>
 </tile>
 <tile id="146">
  <properties>
    <property name="naam" value="oker-huis2-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/oker-huis2-riet-n.png" width="482" height="633"/>
 </tile>
 <tile id="147">
  <properties>
    <property name="naam" value="oker-huis2-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/oker-huis2-riet-w.png" width="482" height="628"/>
 </tile>
 <tile id="148">
  <properties>
    <property name="naam" value="oker-huis2-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/oker-huis2-leien-z.png" width="452" height="581"/>
 </tile>
 <tile id="149">
  <properties>
    <property name="naam" value="oker-huis2-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/oker-huis2-leien-o.png" width="452" height="584"/>
 </tile>
 <tile id="150">
  <properties>
    <property name="naam" value="oker-huis2-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/oker-huis2-leien-n.png" width="452" height="587"/>
 </tile>
 <tile id="151">
  <properties>
    <property name="naam" value="oker-huis2-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/oker-huis2-leien-w.png" width="452" height="581"/>
 </tile>
 <tile id="152">
  <properties>
    <property name="naam" value="oker-huis2-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/oker-huis2-pannen-z.png" width="452" height="581"/>
 </tile>
 <tile id="153">
  <properties>
    <property name="naam" value="oker-huis2-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/oker-huis2-pannen-o.png" width="452" height="584"/>
 </tile>
 <tile id="154">
  <properties>
    <property name="naam" value="oker-huis2-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/oker-huis2-pannen-n.png" width="452" height="587"/>
 </tile>
 <tile id="155">
  <properties>
    <property name="naam" value="oker-huis2-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/oker-huis2-pannen-w.png" width="452" height="581"/>
 </tile>
 <tile id="156">
  <properties>
    <property name="naam" value="oker-steen2-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/oker-steen2-leien-z.png" width="452" height="581"/>
 </tile>
 <tile id="157">
  <properties>
    <property name="naam" value="oker-steen2-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/oker-steen2-leien-o.png" width="452" height="584"/>
 </tile>
 <tile id="158">
  <properties>
    <property name="naam" value="oker-steen2-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/oker-steen2-leien-n.png" width="452" height="587"/>
 </tile>
 <tile id="159">
  <properties>
    <property name="naam" value="oker-steen2-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/oker-steen2-leien-w.png" width="452" height="581"/>
 </tile>
 <tile id="160">
  <properties>
    <property name="naam" value="oker-steen2-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/oker-steen2-pannen-z.png" width="452" height="581"/>
 </tile>
 <tile id="161">
  <properties>
    <property name="naam" value="oker-steen2-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/oker-steen2-pannen-o.png" width="452" height="584"/>
 </tile>
 <tile id="162">
  <properties>
    <property name="naam" value="oker-steen2-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/oker-steen2-pannen-n.png" width="452" height="587"/>
 </tile>
 <tile id="163">
  <properties>
    <property name="naam" value="oker-steen2-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/oker-steen2-pannen-w.png" width="452" height="581"/>
 </tile>
 <tile id="164">
  <properties>
    <property name="naam" value="oker-steen2-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/oker-steen2-baksteen-z.png" width="452" height="581"/>
 </tile>
 <tile id="165">
  <properties>
    <property name="naam" value="oker-steen2-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/oker-steen2-baksteen-o.png" width="452" height="584"/>
 </tile>
 <tile id="166">
  <properties>
    <property name="naam" value="oker-steen2-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/oker-steen2-baksteen-n.png" width="452" height="587"/>
 </tile>
 <tile id="167">
  <properties>
    <property name="naam" value="oker-steen2-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/oker-steen2-baksteen-w.png" width="452" height="581"/>
 </tile>
 <tile id="168">
  <properties>
    <property name="naam" value="oker-huis4-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/oker-huis4-riet-z.png" width="514" height="624"/>
 </tile>
 <tile id="169">
  <properties>
    <property name="naam" value="oker-huis4-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/oker-huis4-riet-o.png" width="614" height="565"/>
 </tile>
 <tile id="170">
  <properties>
    <property name="naam" value="oker-huis4-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-huis4-riet-n.png" width="514" height="616"/>
 </tile>
 <tile id="171">
  <properties>
    <property name="naam" value="oker-huis4-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/oker-huis4-riet-w.png" width="614" height="525"/>
 </tile>
 <tile id="172">
  <properties>
    <property name="naam" value="oker-huis4-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/oker-huis4-leien-z.png" width="484" height="576"/>
 </tile>
 <tile id="173">
  <properties>
    <property name="naam" value="oker-huis4-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/oker-huis4-leien-o.png" width="583" height="518"/>
 </tile>
 <tile id="174">
  <properties>
    <property name="naam" value="oker-huis4-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-huis4-leien-n.png" width="485" height="583"/>
 </tile>
 <tile id="175">
  <properties>
    <property name="naam" value="oker-huis4-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/oker-huis4-leien-w.png" width="583" height="485"/>
 </tile>
 <tile id="176">
  <properties>
    <property name="naam" value="oker-huis4-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/oker-huis4-pannen-z.png" width="485" height="576"/>
 </tile>
 <tile id="177">
  <properties>
    <property name="naam" value="oker-huis4-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/oker-huis4-pannen-o.png" width="583" height="518"/>
 </tile>
 <tile id="178">
  <properties>
    <property name="naam" value="oker-huis4-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-huis4-pannen-n.png" width="485" height="583"/>
 </tile>
 <tile id="179">
  <properties>
    <property name="naam" value="oker-huis4-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/oker-huis4-pannen-w.png" width="583" height="486"/>
 </tile>
 <tile id="180">
  <properties>
    <property name="naam" value="oker-steen4-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/oker-steen4-leien-z.png" width="484" height="576"/>
 </tile>
 <tile id="181">
  <properties>
    <property name="naam" value="oker-steen4-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/oker-steen4-leien-o.png" width="583" height="518"/>
 </tile>
 <tile id="182">
  <properties>
    <property name="naam" value="oker-steen4-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-steen4-leien-n.png" width="485" height="583"/>
 </tile>
 <tile id="183">
  <properties>
    <property name="naam" value="oker-steen4-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/oker-steen4-leien-w.png" width="583" height="485"/>
 </tile>
 <tile id="184">
  <properties>
    <property name="naam" value="oker-steen4-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/oker-steen4-pannen-z.png" width="485" height="576"/>
 </tile>
 <tile id="185">
  <properties>
    <property name="naam" value="oker-steen4-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/oker-steen4-pannen-o.png" width="583" height="518"/>
 </tile>
 <tile id="186">
  <properties>
    <property name="naam" value="oker-steen4-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-steen4-pannen-n.png" width="485" height="583"/>
 </tile>
 <tile id="187">
  <properties>
    <property name="naam" value="oker-steen4-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/oker-steen4-pannen-w.png" width="583" height="486"/>
 </tile>
 <tile id="188">
  <properties>
    <property name="naam" value="oker-steen4-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/oker-steen4-baksteen-z.png" width="485" height="576"/>
 </tile>
 <tile id="189">
  <properties>
    <property name="naam" value="oker-steen4-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/oker-steen4-baksteen-o.png" width="583" height="518"/>
 </tile>
 <tile id="190">
  <properties>
    <property name="naam" value="oker-steen4-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-steen4-baksteen-n.png" width="485" height="583"/>
 </tile>
 <tile id="191">
  <properties>
    <property name="naam" value="oker-steen4-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/oker-steen4-baksteen-w.png" width="583" height="486"/>
 </tile>
 <tile id="192">
  <properties>
    <property name="naam" value="oker-huis5-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,5"/>
  </properties>
  <image source="huizen/oker-huis5-riet-z.png" width="450" height="591"/>
 </tile>
 <tile id="193">
  <properties>
    <property name="naam" value="oker-huis5-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,3"/>
  </properties>
  <image source="huizen/oker-huis5-riet-o.png" width="450" height="593"/>
 </tile>
 <tile id="194">
  <properties>
    <property name="naam" value="oker-huis5-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-huis5-riet-n.png" width="450" height="614"/>
 </tile>
 <tile id="195">
  <properties>
    <property name="naam" value="oker-huis5-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/oker-huis5-riet-w.png" width="450" height="591"/>
 </tile>
 <tile id="196">
  <properties>
    <property name="naam" value="oker-huis5-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,5"/>
  </properties>
  <image source="huizen/oker-huis5-leien-z.png" width="414" height="543"/>
 </tile>
 <tile id="197">
  <properties>
    <property name="naam" value="oker-huis5-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,3"/>
  </properties>
  <image source="huizen/oker-huis5-leien-o.png" width="414" height="538"/>
 </tile>
 <tile id="198">
  <properties>
    <property name="naam" value="oker-huis5-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-huis5-leien-n.png" width="414" height="561"/>
 </tile>
 <tile id="199">
  <properties>
    <property name="naam" value="oker-huis5-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/oker-huis5-leien-w.png" width="414" height="543"/>
 </tile>
 <tile id="200">
  <properties>
    <property name="naam" value="oker-huis5-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,5"/>
  </properties>
  <image source="huizen/oker-huis5-pannen-z.png" width="414" height="543"/>
 </tile>
 <tile id="201">
  <properties>
    <property name="naam" value="oker-huis5-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,3"/>
  </properties>
  <image source="huizen/oker-huis5-pannen-o.png" width="414" height="538"/>
 </tile>
 <tile id="202">
  <properties>
    <property name="naam" value="oker-huis5-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-huis5-pannen-n.png" width="414" height="561"/>
 </tile>
 <tile id="203">
  <properties>
    <property name="naam" value="oker-huis5-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/oker-huis5-pannen-w.png" width="414" height="543"/>
 </tile>
 <tile id="204">
  <properties>
    <property name="naam" value="oker-steen5-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,5"/>
  </properties>
  <image source="huizen/oker-steen5-leien-z.png" width="414" height="543"/>
 </tile>
 <tile id="205">
  <properties>
    <property name="naam" value="oker-steen5-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,3"/>
  </properties>
  <image source="huizen/oker-steen5-leien-o.png" width="414" height="538"/>
 </tile>
 <tile id="206">
  <properties>
    <property name="naam" value="oker-steen5-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-steen5-leien-n.png" width="414" height="561"/>
 </tile>
 <tile id="207">
  <properties>
    <property name="naam" value="oker-steen5-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/oker-steen5-leien-w.png" width="414" height="543"/>
 </tile>
 <tile id="208">
  <properties>
    <property name="naam" value="oker-steen5-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,5"/>
  </properties>
  <image source="huizen/oker-steen5-pannen-z.png" width="414" height="543"/>
 </tile>
 <tile id="209">
  <properties>
    <property name="naam" value="oker-steen5-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,3"/>
  </properties>
  <image source="huizen/oker-steen5-pannen-o.png" width="414" height="538"/>
 </tile>
 <tile id="210">
  <properties>
    <property name="naam" value="oker-steen5-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-steen5-pannen-n.png" width="414" height="561"/>
 </tile>
 <tile id="211">
  <properties>
    <property name="naam" value="oker-steen5-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/oker-steen5-pannen-w.png" width="414" height="543"/>
 </tile>
 <tile id="212">
  <properties>
    <property name="naam" value="oker-steen5-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,5"/>
  </properties>
  <image source="huizen/oker-steen5-baksteen-z.png" width="414" height="543"/>
 </tile>
 <tile id="213">
  <properties>
    <property name="naam" value="oker-steen5-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,3"/>
  </properties>
  <image source="huizen/oker-steen5-baksteen-o.png" width="414" height="538"/>
 </tile>
 <tile id="214">
  <properties>
    <property name="naam" value="oker-steen5-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-steen5-baksteen-n.png" width="414" height="561"/>
 </tile>
 <tile id="215">
  <properties>
    <property name="naam" value="oker-steen5-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/oker-steen5-baksteen-w.png" width="414" height="543"/>
 </tile>
 <tile id="216">
  <properties>
    <property name="naam" value="oker-boerderij6-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/oker-boerderij6-riet-z.png" width="598" height="581"/>
 </tile>
 <tile id="217">
  <properties>
    <property name="naam" value="oker-boerderij6-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x10"/>
    <property name="deur" value="8,5"/>
  </properties>
  <image source="huizen/oker-boerderij6-riet-o.png" width="578" height="599"/>
 </tile>
 <tile id="218">
  <properties>
    <property name="naam" value="oker-boerderij6-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x8"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/oker-boerderij6-riet-n.png" width="598" height="589"/>
 </tile>
 <tile id="219">
  <properties>
    <property name="naam" value="oker-boerderij6-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x10"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/oker-boerderij6-riet-w.png" width="578" height="581"/>
 </tile>
 <tile id="220">
  <properties>
    <property name="naam" value="oker-boerderij6-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/oker-boerderij6-leien-z.png" width="566" height="534"/>
 </tile>
 <tile id="221">
  <properties>
    <property name="naam" value="oker-boerderij6-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x10"/>
    <property name="deur" value="8,5"/>
  </properties>
  <image source="huizen/oker-boerderij6-leien-o.png" width="546" height="551"/>
 </tile>
 <tile id="222">
  <properties>
    <property name="naam" value="oker-boerderij6-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x8"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/oker-boerderij6-leien-n.png" width="566" height="548"/>
 </tile>
 <tile id="223">
  <properties>
    <property name="naam" value="oker-boerderij6-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x10"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/oker-boerderij6-leien-w.png" width="546" height="534"/>
 </tile>
 <tile id="224">
  <properties>
    <property name="naam" value="oker-boerderij6-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/oker-boerderij6-pannen-z.png" width="566" height="534"/>
 </tile>
 <tile id="225">
  <properties>
    <property name="naam" value="oker-boerderij6-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x10"/>
    <property name="deur" value="8,5"/>
  </properties>
  <image source="huizen/oker-boerderij6-pannen-o.png" width="546" height="551"/>
 </tile>
 <tile id="226">
  <properties>
    <property name="naam" value="oker-boerderij6-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x8"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/oker-boerderij6-pannen-n.png" width="566" height="548"/>
 </tile>
 <tile id="227">
  <properties>
    <property name="naam" value="oker-boerderij6-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x10"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/oker-boerderij6-pannen-w.png" width="546" height="534"/>
 </tile>
 <tile id="228">
  <properties>
    <property name="naam" value="oker-boerderij7-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="3,6"/>
  </properties>
  <image source="huizen/oker-boerderij7-riet-z.png" width="578" height="673"/>
 </tile>
 <tile id="229">
  <properties>
    <property name="naam" value="oker-boerderij7-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="6,5"/>
  </properties>
  <image source="huizen/oker-boerderij7-riet-o.png" width="578" height="667"/>
 </tile>
 <tile id="230">
  <properties>
    <property name="naam" value="oker-boerderij7-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/oker-boerderij7-riet-n.png" width="578" height="667"/>
 </tile>
 <tile id="231">
  <properties>
    <property name="naam" value="oker-boerderij7-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/oker-boerderij7-riet-w.png" width="578" height="673"/>
 </tile>
 <tile id="232">
  <properties>
    <property name="naam" value="oker-boerderij7-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="3,6"/>
  </properties>
  <image source="huizen/oker-boerderij7-leien-z.png" width="548" height="625"/>
 </tile>
 <tile id="233">
  <properties>
    <property name="naam" value="oker-boerderij7-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="6,5"/>
  </properties>
  <image source="huizen/oker-boerderij7-leien-o.png" width="548" height="619"/>
 </tile>
 <tile id="234">
  <properties>
    <property name="naam" value="oker-boerderij7-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/oker-boerderij7-leien-n.png" width="548" height="619"/>
 </tile>
 <tile id="235">
  <properties>
    <property name="naam" value="oker-boerderij7-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/oker-boerderij7-leien-w.png" width="548" height="625"/>
 </tile>
 <tile id="236">
  <properties>
    <property name="naam" value="oker-boerderij7-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="3,6"/>
  </properties>
  <image source="huizen/oker-boerderij7-pannen-z.png" width="548" height="625"/>
 </tile>
 <tile id="237">
  <properties>
    <property name="naam" value="oker-boerderij7-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="6,5"/>
  </properties>
  <image source="huizen/oker-boerderij7-pannen-o.png" width="548" height="619"/>
 </tile>
 <tile id="238">
  <properties>
    <property name="naam" value="oker-boerderij7-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/oker-boerderij7-pannen-n.png" width="548" height="619"/>
 </tile>
 <tile id="239">
  <properties>
    <property name="naam" value="oker-boerderij7-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/oker-boerderij7-pannen-w.png" width="548" height="625"/>
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
  <image source="huizen/planken-huis7-spanen-z.png" width="556" height="708"/>
 </tile>
 <tile id="253">
  <properties>
    <property name="naam" value="planken-huis7-spanen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-huis7-spanen-o.png" width="556" height="719"/>
 </tile>
 <tile id="254">
  <properties>
    <property name="naam" value="planken-huis7-spanen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-huis7-spanen-n.png" width="556" height="717"/>
 </tile>
 <tile id="255">
  <properties>
    <property name="naam" value="planken-huis7-spanen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-huis7-spanen-w.png" width="556" height="708"/>
 </tile>
 <tile id="256">
  <properties>
    <property name="naam" value="planken-huis7-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-huis7-leien-z.png" width="556" height="708"/>
 </tile>
 <tile id="257">
  <properties>
    <property name="naam" value="planken-huis7-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-huis7-leien-o.png" width="556" height="719"/>
 </tile>
 <tile id="258">
  <properties>
    <property name="naam" value="planken-huis7-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-huis7-leien-n.png" width="556" height="717"/>
 </tile>
 <tile id="259">
  <properties>
    <property name="naam" value="planken-huis7-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-huis7-leien-w.png" width="556" height="708"/>
 </tile>
 <tile id="260">
  <properties>
    <property name="naam" value="planken-huis7-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-huis7-pannen-z.png" width="556" height="708"/>
 </tile>
 <tile id="261">
  <properties>
    <property name="naam" value="planken-huis7-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-huis7-pannen-o.png" width="556" height="719"/>
 </tile>
 <tile id="262">
  <properties>
    <property name="naam" value="planken-huis7-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-huis7-pannen-n.png" width="556" height="717"/>
 </tile>
 <tile id="263">
  <properties>
    <property name="naam" value="planken-huis7-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-huis7-pannen-w.png" width="556" height="708"/>
 </tile>
 <tile id="264">
  <properties>
    <property name="naam" value="planken-steen7-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-steen7-leien-z.png" width="556" height="708"/>
 </tile>
 <tile id="265">
  <properties>
    <property name="naam" value="planken-steen7-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-steen7-leien-o.png" width="556" height="719"/>
 </tile>
 <tile id="266">
  <properties>
    <property name="naam" value="planken-steen7-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-steen7-leien-n.png" width="556" height="717"/>
 </tile>
 <tile id="267">
  <properties>
    <property name="naam" value="planken-steen7-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-steen7-leien-w.png" width="556" height="708"/>
 </tile>
 <tile id="268">
  <properties>
    <property name="naam" value="planken-steen7-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-steen7-pannen-z.png" width="556" height="708"/>
 </tile>
 <tile id="269">
  <properties>
    <property name="naam" value="planken-steen7-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-steen7-pannen-o.png" width="556" height="719"/>
 </tile>
 <tile id="270">
  <properties>
    <property name="naam" value="planken-steen7-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-steen7-pannen-n.png" width="556" height="717"/>
 </tile>
 <tile id="271">
  <properties>
    <property name="naam" value="planken-steen7-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-steen7-pannen-w.png" width="556" height="708"/>
 </tile>
 <tile id="272">
  <properties>
    <property name="naam" value="planken-steen7-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-steen7-baksteen-z.png" width="556" height="708"/>
 </tile>
 <tile id="273">
  <properties>
    <property name="naam" value="planken-steen7-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-steen7-baksteen-o.png" width="556" height="719"/>
 </tile>
 <tile id="274">
  <properties>
    <property name="naam" value="planken-steen7-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-steen7-baksteen-n.png" width="556" height="717"/>
 </tile>
 <tile id="275">
  <properties>
    <property name="naam" value="planken-steen7-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-steen7-baksteen-w.png" width="556" height="708"/>
 </tile>
 <tile id="276">
  <properties>
    <property name="naam" value="planken-huis8-spanen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-huis8-spanen-z.png" width="545" height="639"/>
 </tile>
 <tile id="277">
  <properties>
    <property name="naam" value="planken-huis8-spanen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-huis8-spanen-o.png" width="522" height="663"/>
 </tile>
 <tile id="278">
  <properties>
    <property name="naam" value="planken-huis8-spanen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-huis8-spanen-n.png" width="545" height="593"/>
 </tile>
 <tile id="279">
  <properties>
    <property name="naam" value="planken-huis8-spanen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-huis8-spanen-w.png" width="522" height="671"/>
 </tile>
 <tile id="280">
  <properties>
    <property name="naam" value="planken-huis8-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-huis8-leien-z.png" width="545" height="639"/>
 </tile>
 <tile id="281">
  <properties>
    <property name="naam" value="planken-huis8-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-huis8-leien-o.png" width="525" height="663"/>
 </tile>
 <tile id="282">
  <properties>
    <property name="naam" value="planken-huis8-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-huis8-leien-n.png" width="545" height="595"/>
 </tile>
 <tile id="283">
  <properties>
    <property name="naam" value="planken-huis8-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-huis8-leien-w.png" width="524" height="671"/>
 </tile>
 <tile id="284">
  <properties>
    <property name="naam" value="planken-huis8-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-huis8-pannen-z.png" width="545" height="639"/>
 </tile>
 <tile id="285">
  <properties>
    <property name="naam" value="planken-huis8-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-huis8-pannen-o.png" width="525" height="663"/>
 </tile>
 <tile id="286">
  <properties>
    <property name="naam" value="planken-huis8-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-huis8-pannen-n.png" width="545" height="596"/>
 </tile>
 <tile id="287">
  <properties>
    <property name="naam" value="planken-huis8-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-huis8-pannen-w.png" width="524" height="671"/>
 </tile>
 <tile id="288">
  <properties>
    <property name="naam" value="planken-steen8-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-steen8-leien-z.png" width="545" height="639"/>
 </tile>
 <tile id="289">
  <properties>
    <property name="naam" value="planken-steen8-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-steen8-leien-o.png" width="525" height="663"/>
 </tile>
 <tile id="290">
  <properties>
    <property name="naam" value="planken-steen8-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-steen8-leien-n.png" width="545" height="595"/>
 </tile>
 <tile id="291">
  <properties>
    <property name="naam" value="planken-steen8-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-steen8-leien-w.png" width="524" height="671"/>
 </tile>
 <tile id="292">
  <properties>
    <property name="naam" value="planken-steen8-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-steen8-pannen-z.png" width="545" height="639"/>
 </tile>
 <tile id="293">
  <properties>
    <property name="naam" value="planken-steen8-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-steen8-pannen-o.png" width="525" height="663"/>
 </tile>
 <tile id="294">
  <properties>
    <property name="naam" value="planken-steen8-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-steen8-pannen-n.png" width="545" height="596"/>
 </tile>
 <tile id="295">
  <properties>
    <property name="naam" value="planken-steen8-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-steen8-pannen-w.png" width="524" height="671"/>
 </tile>
 <tile id="296">
  <properties>
    <property name="naam" value="planken-steen8-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-steen8-baksteen-z.png" width="545" height="639"/>
 </tile>
 <tile id="297">
  <properties>
    <property name="naam" value="planken-steen8-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-steen8-baksteen-o.png" width="525" height="663"/>
 </tile>
 <tile id="298">
  <properties>
    <property name="naam" value="planken-steen8-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-steen8-baksteen-n.png" width="545" height="596"/>
 </tile>
 <tile id="299">
  <properties>
    <property name="naam" value="planken-steen8-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-steen8-baksteen-w.png" width="524" height="671"/>
 </tile>
 <tile id="300">
  <properties>
    <property name="naam" value="planken-huis9-spanen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/planken-huis9-spanen-z.png" width="485" height="544"/>
 </tile>
 <tile id="301">
  <properties>
    <property name="naam" value="planken-huis9-spanen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,2"/>
  </properties>
  <image source="huizen/planken-huis9-spanen-o.png" width="523" height="526"/>
 </tile>
 <tile id="302">
  <properties>
    <property name="naam" value="planken-huis9-spanen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/planken-huis9-spanen-n.png" width="485" height="526"/>
 </tile>
 <tile id="303">
  <properties>
    <property name="naam" value="planken-huis9-spanen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/planken-huis9-spanen-w.png" width="523" height="534"/>
 </tile>
 <tile id="304">
  <properties>
    <property name="naam" value="planken-huis9-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/planken-huis9-leien-z.png" width="485" height="544"/>
 </tile>
 <tile id="305">
  <properties>
    <property name="naam" value="planken-huis9-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,2"/>
  </properties>
  <image source="huizen/planken-huis9-leien-o.png" width="523" height="526"/>
 </tile>
 <tile id="306">
  <properties>
    <property name="naam" value="planken-huis9-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/planken-huis9-leien-n.png" width="485" height="526"/>
 </tile>
 <tile id="307">
  <properties>
    <property name="naam" value="planken-huis9-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/planken-huis9-leien-w.png" width="523" height="534"/>
 </tile>
 <tile id="308">
  <properties>
    <property name="naam" value="planken-huis9-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/planken-huis9-pannen-z.png" width="485" height="544"/>
 </tile>
 <tile id="309">
  <properties>
    <property name="naam" value="planken-huis9-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,2"/>
  </properties>
  <image source="huizen/planken-huis9-pannen-o.png" width="523" height="526"/>
 </tile>
 <tile id="310">
  <properties>
    <property name="naam" value="planken-huis9-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/planken-huis9-pannen-n.png" width="485" height="526"/>
 </tile>
 <tile id="311">
  <properties>
    <property name="naam" value="planken-huis9-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/planken-huis9-pannen-w.png" width="523" height="534"/>
 </tile>
 <tile id="312">
  <properties>
    <property name="naam" value="planken-steen9-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/planken-steen9-leien-z.png" width="485" height="544"/>
 </tile>
 <tile id="313">
  <properties>
    <property name="naam" value="planken-steen9-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="7,1"/>
  </properties>
  <image source="huizen/planken-steen9-leien-o.png" width="523" height="526"/>
 </tile>
 <tile id="314">
  <properties>
    <property name="naam" value="planken-steen9-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="1,-1"/>
  </properties>
  <image source="huizen/planken-steen9-leien-n.png" width="485" height="526"/>
 </tile>
 <tile id="315">
  <properties>
    <property name="naam" value="planken-steen9-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/planken-steen9-leien-w.png" width="523" height="527"/>
 </tile>
 <tile id="316">
  <properties>
    <property name="naam" value="planken-steen9-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/planken-steen9-pannen-z.png" width="485" height="544"/>
 </tile>
 <tile id="317">
  <properties>
    <property name="naam" value="planken-steen9-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="7,1"/>
  </properties>
  <image source="huizen/planken-steen9-pannen-o.png" width="523" height="526"/>
 </tile>
 <tile id="318">
  <properties>
    <property name="naam" value="planken-steen9-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="1,-1"/>
  </properties>
  <image source="huizen/planken-steen9-pannen-n.png" width="485" height="526"/>
 </tile>
 <tile id="319">
  <properties>
    <property name="naam" value="planken-steen9-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/planken-steen9-pannen-w.png" width="523" height="527"/>
 </tile>
 <tile id="320">
  <properties>
    <property name="naam" value="planken-steen9-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/planken-steen9-baksteen-z.png" width="485" height="544"/>
 </tile>
 <tile id="321">
  <properties>
    <property name="naam" value="planken-steen9-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="7,1"/>
  </properties>
  <image source="huizen/planken-steen9-baksteen-o.png" width="523" height="526"/>
 </tile>
 <tile id="322">
  <properties>
    <property name="naam" value="planken-steen9-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="1,-1"/>
  </properties>
  <image source="huizen/planken-steen9-baksteen-n.png" width="485" height="526"/>
 </tile>
 <tile id="323">
  <properties>
    <property name="naam" value="planken-steen9-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/planken-steen9-baksteen-w.png" width="523" height="527"/>
 </tile>
 <tile id="324">
  <properties>
    <property name="naam" value="planken-boerderij2-spanen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/planken-boerderij2-spanen-z.png" width="513" height="546"/>
 </tile>
 <tile id="325">
  <properties>
    <property name="naam" value="planken-boerderij2-spanen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,4"/>
  </properties>
  <image source="huizen/planken-boerderij2-spanen-o.png" width="549" height="552"/>
 </tile>
 <tile id="326">
  <properties>
    <property name="naam" value="planken-boerderij2-spanen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-boerderij2-spanen-n.png" width="512" height="574"/>
 </tile>
 <tile id="327">
  <properties>
    <property name="naam" value="planken-boerderij2-spanen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-boerderij2-spanen-w.png" width="550" height="546"/>
 </tile>
 <tile id="328">
  <properties>
    <property name="naam" value="planken-boerderij2-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/planken-boerderij2-leien-z.png" width="513" height="546"/>
 </tile>
 <tile id="329">
  <properties>
    <property name="naam" value="planken-boerderij2-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,4"/>
  </properties>
  <image source="huizen/planken-boerderij2-leien-o.png" width="549" height="552"/>
 </tile>
 <tile id="330">
  <properties>
    <property name="naam" value="planken-boerderij2-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-boerderij2-leien-n.png" width="512" height="574"/>
 </tile>
 <tile id="331">
  <properties>
    <property name="naam" value="planken-boerderij2-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-boerderij2-leien-w.png" width="550" height="546"/>
 </tile>
 <tile id="332">
  <properties>
    <property name="naam" value="planken-boerderij2-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/planken-boerderij2-pannen-z.png" width="513" height="546"/>
 </tile>
 <tile id="333">
  <properties>
    <property name="naam" value="planken-boerderij2-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,4"/>
  </properties>
  <image source="huizen/planken-boerderij2-pannen-o.png" width="549" height="552"/>
 </tile>
 <tile id="334">
  <properties>
    <property name="naam" value="planken-boerderij2-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-boerderij2-pannen-n.png" width="512" height="574"/>
 </tile>
 <tile id="335">
  <properties>
    <property name="naam" value="planken-boerderij2-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-boerderij2-pannen-w.png" width="550" height="546"/>
 </tile>
 <tile id="336">
  <properties>
    <property name="naam" value="planken-boerderij5-spanen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/planken-boerderij5-spanen-z.png" width="514" height="522"/>
 </tile>
 <tile id="337">
  <properties>
    <property name="naam" value="planken-boerderij5-spanen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="6,4"/>
  </properties>
  <image source="huizen/planken-boerderij5-spanen-o.png" width="514" height="519"/>
 </tile>
 <tile id="338">
  <properties>
    <property name="naam" value="planken-boerderij5-spanen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-boerderij5-spanen-n.png" width="514" height="528"/>
 </tile>
 <tile id="339">
  <properties>
    <property name="naam" value="planken-boerderij5-spanen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-boerderij5-spanen-w.png" width="514" height="522"/>
 </tile>
 <tile id="340">
  <properties>
    <property name="naam" value="planken-boerderij5-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/planken-boerderij5-leien-z.png" width="514" height="522"/>
 </tile>
 <tile id="341">
  <properties>
    <property name="naam" value="planken-boerderij5-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="6,4"/>
  </properties>
  <image source="huizen/planken-boerderij5-leien-o.png" width="514" height="519"/>
 </tile>
 <tile id="342">
  <properties>
    <property name="naam" value="planken-boerderij5-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-boerderij5-leien-n.png" width="514" height="528"/>
 </tile>
 <tile id="343">
  <properties>
    <property name="naam" value="planken-boerderij5-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-boerderij5-leien-w.png" width="514" height="522"/>
 </tile>
 <tile id="344">
  <properties>
    <property name="naam" value="planken-boerderij5-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/planken-boerderij5-pannen-z.png" width="514" height="522"/>
 </tile>
 <tile id="345">
  <properties>
    <property name="naam" value="planken-boerderij5-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="6,4"/>
  </properties>
  <image source="huizen/planken-boerderij5-pannen-o.png" width="514" height="519"/>
 </tile>
 <tile id="346">
  <properties>
    <property name="naam" value="planken-boerderij5-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-boerderij5-pannen-n.png" width="514" height="528"/>
 </tile>
 <tile id="347">
  <properties>
    <property name="naam" value="planken-boerderij5-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-boerderij5-pannen-w.png" width="514" height="522"/>
 </tile>
 <tile id="348">
  <properties>
    <property name="naam" value="roze-huis10-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/roze-huis10-riet-z.png" width="526" height="703"/>
 </tile>
 <tile id="349">
  <properties>
    <property name="naam" value="roze-huis10-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/roze-huis10-riet-o.png" width="526" height="692"/>
 </tile>
 <tile id="350">
  <properties>
    <property name="naam" value="roze-huis10-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-huis10-riet-n.png" width="526" height="692"/>
 </tile>
 <tile id="351">
  <properties>
    <property name="naam" value="roze-huis10-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/roze-huis10-riet-w.png" width="526" height="703"/>
 </tile>
 <tile id="352">
  <properties>
    <property name="naam" value="roze-huis10-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/roze-huis10-leien-z.png" width="498" height="655"/>
 </tile>
 <tile id="353">
  <properties>
    <property name="naam" value="roze-huis10-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/roze-huis10-leien-o.png" width="498" height="645"/>
 </tile>
 <tile id="354">
  <properties>
    <property name="naam" value="roze-huis10-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-huis10-leien-n.png" width="498" height="645"/>
 </tile>
 <tile id="355">
  <properties>
    <property name="naam" value="roze-huis10-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/roze-huis10-leien-w.png" width="498" height="655"/>
 </tile>
 <tile id="356">
  <properties>
    <property name="naam" value="roze-huis10-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/roze-huis10-pannen-z.png" width="498" height="655"/>
 </tile>
 <tile id="357">
  <properties>
    <property name="naam" value="roze-huis10-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/roze-huis10-pannen-o.png" width="498" height="645"/>
 </tile>
 <tile id="358">
  <properties>
    <property name="naam" value="roze-huis10-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-huis10-pannen-n.png" width="498" height="645"/>
 </tile>
 <tile id="359">
  <properties>
    <property name="naam" value="roze-huis10-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/roze-huis10-pannen-w.png" width="498" height="655"/>
 </tile>
 <tile id="360">
  <properties>
    <property name="naam" value="roze-steen10-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/roze-steen10-leien-z.png" width="498" height="655"/>
 </tile>
 <tile id="361">
  <properties>
    <property name="naam" value="roze-steen10-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/roze-steen10-leien-o.png" width="498" height="645"/>
 </tile>
 <tile id="362">
  <properties>
    <property name="naam" value="roze-steen10-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-steen10-leien-n.png" width="498" height="645"/>
 </tile>
 <tile id="363">
  <properties>
    <property name="naam" value="roze-steen10-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/roze-steen10-leien-w.png" width="498" height="655"/>
 </tile>
 <tile id="364">
  <properties>
    <property name="naam" value="roze-steen10-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/roze-steen10-pannen-z.png" width="498" height="655"/>
 </tile>
 <tile id="365">
  <properties>
    <property name="naam" value="roze-steen10-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/roze-steen10-pannen-o.png" width="498" height="645"/>
 </tile>
 <tile id="366">
  <properties>
    <property name="naam" value="roze-steen10-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-steen10-pannen-n.png" width="498" height="645"/>
 </tile>
 <tile id="367">
  <properties>
    <property name="naam" value="roze-steen10-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/roze-steen10-pannen-w.png" width="498" height="655"/>
 </tile>
 <tile id="368">
  <properties>
    <property name="naam" value="roze-steen10-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/roze-steen10-baksteen-z.png" width="498" height="655"/>
 </tile>
 <tile id="369">
  <properties>
    <property name="naam" value="roze-steen10-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/roze-steen10-baksteen-o.png" width="498" height="645"/>
 </tile>
 <tile id="370">
  <properties>
    <property name="naam" value="roze-steen10-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-steen10-baksteen-n.png" width="498" height="645"/>
 </tile>
 <tile id="371">
  <properties>
    <property name="naam" value="roze-steen10-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/roze-steen10-baksteen-w.png" width="498" height="655"/>
 </tile>
 <tile id="372">
  <properties>
    <property name="naam" value="roze-huis11-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,6"/>
  </properties>
  <image source="huizen/roze-huis11-riet-z.png" width="546" height="617"/>
 </tile>
 <tile id="373">
  <properties>
    <property name="naam" value="roze-huis11-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,4"/>
  </properties>
  <image source="huizen/roze-huis11-riet-o.png" width="546" height="612"/>
 </tile>
 <tile id="374">
  <properties>
    <property name="naam" value="roze-huis11-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-huis11-riet-n.png" width="546" height="612"/>
 </tile>
 <tile id="375">
  <properties>
    <property name="naam" value="roze-huis11-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/roze-huis11-riet-w.png" width="546" height="617"/>
 </tile>
 <tile id="376">
  <properties>
    <property name="naam" value="roze-huis11-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,6"/>
  </properties>
  <image source="huizen/roze-huis11-leien-z.png" width="511" height="570"/>
 </tile>
 <tile id="377">
  <properties>
    <property name="naam" value="roze-huis11-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,4"/>
  </properties>
  <image source="huizen/roze-huis11-leien-o.png" width="511" height="565"/>
 </tile>
 <tile id="378">
  <properties>
    <property name="naam" value="roze-huis11-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-huis11-leien-n.png" width="511" height="565"/>
 </tile>
 <tile id="379">
  <properties>
    <property name="naam" value="roze-huis11-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/roze-huis11-leien-w.png" width="511" height="570"/>
 </tile>
 <tile id="380">
  <properties>
    <property name="naam" value="roze-huis11-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,6"/>
  </properties>
  <image source="huizen/roze-huis11-pannen-z.png" width="511" height="570"/>
 </tile>
 <tile id="381">
  <properties>
    <property name="naam" value="roze-huis11-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,4"/>
  </properties>
  <image source="huizen/roze-huis11-pannen-o.png" width="511" height="565"/>
 </tile>
 <tile id="382">
  <properties>
    <property name="naam" value="roze-huis11-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-huis11-pannen-n.png" width="511" height="565"/>
 </tile>
 <tile id="383">
  <properties>
    <property name="naam" value="roze-huis11-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/roze-huis11-pannen-w.png" width="511" height="570"/>
 </tile>
 <tile id="384">
  <properties>
    <property name="naam" value="roze-steen11-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,6"/>
  </properties>
  <image source="huizen/roze-steen11-leien-z.png" width="511" height="570"/>
 </tile>
 <tile id="385">
  <properties>
    <property name="naam" value="roze-steen11-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,4"/>
  </properties>
  <image source="huizen/roze-steen11-leien-o.png" width="511" height="565"/>
 </tile>
 <tile id="386">
  <properties>
    <property name="naam" value="roze-steen11-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-steen11-leien-n.png" width="511" height="565"/>
 </tile>
 <tile id="387">
  <properties>
    <property name="naam" value="roze-steen11-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/roze-steen11-leien-w.png" width="511" height="570"/>
 </tile>
 <tile id="388">
  <properties>
    <property name="naam" value="roze-steen11-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,6"/>
  </properties>
  <image source="huizen/roze-steen11-pannen-z.png" width="511" height="570"/>
 </tile>
 <tile id="389">
  <properties>
    <property name="naam" value="roze-steen11-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,4"/>
  </properties>
  <image source="huizen/roze-steen11-pannen-o.png" width="511" height="565"/>
 </tile>
 <tile id="390">
  <properties>
    <property name="naam" value="roze-steen11-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-steen11-pannen-n.png" width="511" height="565"/>
 </tile>
 <tile id="391">
  <properties>
    <property name="naam" value="roze-steen11-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/roze-steen11-pannen-w.png" width="511" height="570"/>
 </tile>
 <tile id="392">
  <properties>
    <property name="naam" value="roze-steen11-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,6"/>
  </properties>
  <image source="huizen/roze-steen11-baksteen-z.png" width="511" height="570"/>
 </tile>
 <tile id="393">
  <properties>
    <property name="naam" value="roze-steen11-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,4"/>
  </properties>
  <image source="huizen/roze-steen11-baksteen-o.png" width="511" height="565"/>
 </tile>
 <tile id="394">
  <properties>
    <property name="naam" value="roze-steen11-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-steen11-baksteen-n.png" width="511" height="565"/>
 </tile>
 <tile id="395">
  <properties>
    <property name="naam" value="roze-steen11-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/roze-steen11-baksteen-w.png" width="511" height="570"/>
 </tile>
 <tile id="396">
  <properties>
    <property name="naam" value="roze-huis12-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/roze-huis12-riet-z.png" width="546" height="659"/>
 </tile>
 <tile id="397">
  <properties>
    <property name="naam" value="roze-huis12-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,4"/>
  </properties>
  <image source="huizen/roze-huis12-riet-o.png" width="598" height="655"/>
 </tile>
 <tile id="398">
  <properties>
    <property name="naam" value="roze-huis12-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-huis12-riet-n.png" width="546" height="681"/>
 </tile>
 <tile id="399">
  <properties>
    <property name="naam" value="roze-huis12-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-huis12-riet-w.png" width="598" height="649"/>
 </tile>
 <tile id="400">
  <properties>
    <property name="naam" value="roze-huis12-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/roze-huis12-leien-z.png" width="513" height="610"/>
 </tile>
 <tile id="401">
  <properties>
    <property name="naam" value="roze-huis12-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,4"/>
  </properties>
  <image source="huizen/roze-huis12-leien-o.png" width="564" height="608"/>
 </tile>
 <tile id="402">
  <properties>
    <property name="naam" value="roze-huis12-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-huis12-leien-n.png" width="512" height="645"/>
 </tile>
 <tile id="403">
  <properties>
    <property name="naam" value="roze-huis12-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-huis12-leien-w.png" width="565" height="602"/>
 </tile>
 <tile id="404">
  <properties>
    <property name="naam" value="roze-huis12-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/roze-huis12-pannen-z.png" width="513" height="610"/>
 </tile>
 <tile id="405">
  <properties>
    <property name="naam" value="roze-huis12-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,4"/>
  </properties>
  <image source="huizen/roze-huis12-pannen-o.png" width="564" height="608"/>
 </tile>
 <tile id="406">
  <properties>
    <property name="naam" value="roze-huis12-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-huis12-pannen-n.png" width="512" height="645"/>
 </tile>
 <tile id="407">
  <properties>
    <property name="naam" value="roze-huis12-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-huis12-pannen-w.png" width="565" height="602"/>
 </tile>
 <tile id="408">
  <properties>
    <property name="naam" value="roze-steen12-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/roze-steen12-leien-z.png" width="513" height="610"/>
 </tile>
 <tile id="409">
  <properties>
    <property name="naam" value="roze-steen12-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,4"/>
  </properties>
  <image source="huizen/roze-steen12-leien-o.png" width="564" height="608"/>
 </tile>
 <tile id="410">
  <properties>
    <property name="naam" value="roze-steen12-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-steen12-leien-n.png" width="512" height="645"/>
 </tile>
 <tile id="411">
  <properties>
    <property name="naam" value="roze-steen12-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-steen12-leien-w.png" width="565" height="602"/>
 </tile>
 <tile id="412">
  <properties>
    <property name="naam" value="roze-steen12-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/roze-steen12-pannen-z.png" width="513" height="610"/>
 </tile>
 <tile id="413">
  <properties>
    <property name="naam" value="roze-steen12-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,4"/>
  </properties>
  <image source="huizen/roze-steen12-pannen-o.png" width="564" height="608"/>
 </tile>
 <tile id="414">
  <properties>
    <property name="naam" value="roze-steen12-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-steen12-pannen-n.png" width="512" height="645"/>
 </tile>
 <tile id="415">
  <properties>
    <property name="naam" value="roze-steen12-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-steen12-pannen-w.png" width="565" height="602"/>
 </tile>
 <tile id="416">
  <properties>
    <property name="naam" value="roze-steen12-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/roze-steen12-baksteen-z.png" width="513" height="610"/>
 </tile>
 <tile id="417">
  <properties>
    <property name="naam" value="roze-steen12-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,4"/>
  </properties>
  <image source="huizen/roze-steen12-baksteen-o.png" width="564" height="608"/>
 </tile>
 <tile id="418">
  <properties>
    <property name="naam" value="roze-steen12-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-steen12-baksteen-n.png" width="512" height="645"/>
 </tile>
 <tile id="419">
  <properties>
    <property name="naam" value="roze-steen12-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-steen12-baksteen-w.png" width="565" height="602"/>
 </tile>
 <tile id="420">
  <properties>
    <property name="naam" value="roze-boerderij8-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/roze-boerderij8-riet-z.png" width="546" height="617"/>
 </tile>
 <tile id="421">
  <properties>
    <property name="naam" value="roze-boerderij8-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/roze-boerderij8-riet-o.png" width="608" height="579"/>
 </tile>
 <tile id="422">
  <properties>
    <property name="naam" value="roze-boerderij8-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-boerderij8-riet-n.png" width="546" height="609"/>
 </tile>
 <tile id="423">
  <properties>
    <property name="naam" value="roze-boerderij8-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-boerderij8-riet-w.png" width="608" height="539"/>
 </tile>
 <tile id="424">
  <properties>
    <property name="naam" value="roze-boerderij8-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/roze-boerderij8-leien-z.png" width="523" height="569"/>
 </tile>
 <tile id="425">
  <properties>
    <property name="naam" value="roze-boerderij8-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/roze-boerderij8-leien-o.png" width="577" height="531"/>
 </tile>
 <tile id="426">
  <properties>
    <property name="naam" value="roze-boerderij8-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-boerderij8-leien-n.png" width="524" height="561"/>
 </tile>
 <tile id="427">
  <properties>
    <property name="naam" value="roze-boerderij8-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-boerderij8-leien-w.png" width="577" height="500"/>
 </tile>
 <tile id="428">
  <properties>
    <property name="naam" value="roze-boerderij8-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/roze-boerderij8-pannen-z.png" width="524" height="569"/>
 </tile>
 <tile id="429">
  <properties>
    <property name="naam" value="roze-boerderij8-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/roze-boerderij8-pannen-o.png" width="577" height="531"/>
 </tile>
 <tile id="430">
  <properties>
    <property name="naam" value="roze-boerderij8-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-boerderij8-pannen-n.png" width="524" height="561"/>
 </tile>
 <tile id="431">
  <properties>
    <property name="naam" value="roze-boerderij8-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-boerderij8-pannen-w.png" width="577" height="501"/>
 </tile>
 <tile id="432">
  <properties>
    <property name="naam" value="roze-boerderij9-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/roze-boerderij9-riet-z.png" width="610" height="703"/>
 </tile>
 <tile id="433">
  <properties>
    <property name="naam" value="roze-boerderij9-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x10"/>
    <property name="deur" value="6,5"/>
  </properties>
  <image source="huizen/roze-boerderij9-riet-o.png" width="610" height="708"/>
 </tile>
 <tile id="434">
  <properties>
    <property name="naam" value="roze-boerderij9-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x6"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/roze-boerderij9-riet-n.png" width="610" height="708"/>
 </tile>
 <tile id="435">
  <properties>
    <property name="naam" value="roze-boerderij9-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x10"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-boerderij9-riet-w.png" width="610" height="703"/>
 </tile>
 <tile id="436">
  <properties>
    <property name="naam" value="roze-boerderij9-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/roze-boerderij9-leien-z.png" width="578" height="656"/>
 </tile>
 <tile id="437">
  <properties>
    <property name="naam" value="roze-boerderij9-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x10"/>
    <property name="deur" value="6,5"/>
  </properties>
  <image source="huizen/roze-boerderij9-leien-o.png" width="578" height="661"/>
 </tile>
 <tile id="438">
  <properties>
    <property name="naam" value="roze-boerderij9-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x6"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/roze-boerderij9-leien-n.png" width="578" height="661"/>
 </tile>
 <tile id="439">
  <properties>
    <property name="naam" value="roze-boerderij9-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x10"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-boerderij9-leien-w.png" width="578" height="656"/>
 </tile>
 <tile id="440">
  <properties>
    <property name="naam" value="roze-boerderij9-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/roze-boerderij9-pannen-z.png" width="578" height="656"/>
 </tile>
 <tile id="441">
  <properties>
    <property name="naam" value="roze-boerderij9-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x10"/>
    <property name="deur" value="6,5"/>
  </properties>
  <image source="huizen/roze-boerderij9-pannen-o.png" width="578" height="661"/>
 </tile>
 <tile id="442">
  <properties>
    <property name="naam" value="roze-boerderij9-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x6"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/roze-boerderij9-pannen-n.png" width="578" height="661"/>
 </tile>
 <tile id="443">
  <properties>
    <property name="naam" value="roze-boerderij9-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x10"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-boerderij9-pannen-w.png" width="578" height="656"/>
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
    <property name="naam" value="wit-herberg1-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="11x8"/>
    <property name="deur" value="5,8"/>
  </properties>
  <image source="huizen/wit-herberg1-riet-z.png" width="610" height="629"/>
 </tile>
 <tile id="449">
  <properties>
    <property name="naam" value="wit-herberg1-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x11"/>
    <property name="deur" value="8,5"/>
  </properties>
  <image source="huizen/wit-herberg1-riet-o.png" width="623" height="629"/>
 </tile>
 <tile id="450">
  <properties>
    <property name="naam" value="wit-herberg1-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="11x8"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/wit-herberg1-riet-n.png" width="610" height="635"/>
 </tile>
 <tile id="451">
  <properties>
    <property name="naam" value="wit-herberg1-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x11"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/wit-herberg1-riet-w.png" width="623" height="629"/>
 </tile>
 <tile id="452">
  <properties>
    <property name="naam" value="wit-herberg2-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="5,6"/>
  </properties>
  <image source="huizen/wit-herberg2-leien-z.png" width="683" height="750"/>
 </tile>
 <tile id="453">
  <properties>
    <property name="naam" value="wit-herberg2-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="6,6"/>
  </properties>
  <image source="huizen/wit-herberg2-leien-o.png" width="683" height="750"/>
 </tile>
 <tile id="454">
  <properties>
    <property name="naam" value="wit-herberg2-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="6,-1"/>
  </properties>
  <image source="huizen/wit-herberg2-leien-n.png" width="683" height="750"/>
 </tile>
 <tile id="455">
  <properties>
    <property name="naam" value="wit-herberg2-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/wit-herberg2-leien-w.png" width="683" height="750"/>
 </tile>
 <tile id="456">
  <properties>
    <property name="naam" value="wit-herberg2-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="5,6"/>
  </properties>
  <image source="huizen/wit-herberg2-pannen-z.png" width="683" height="706"/>
 </tile>
 <tile id="457">
  <properties>
    <property name="naam" value="wit-herberg2-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="6,6"/>
  </properties>
  <image source="huizen/wit-herberg2-pannen-o.png" width="683" height="705"/>
 </tile>
 <tile id="458">
  <properties>
    <property name="naam" value="wit-herberg2-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="6,-1"/>
  </properties>
  <image source="huizen/wit-herberg2-pannen-n.png" width="683" height="705"/>
 </tile>
 <tile id="459">
  <properties>
    <property name="naam" value="wit-herberg2-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/wit-herberg2-pannen-w.png" width="683" height="706"/>
 </tile>
 <tile id="460">
  <properties>
    <property name="naam" value="wit-kapel-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="18x6"/>
    <property name="deur" value="14,6"/>
  </properties>
  <image source="huizen/wit-kapel-leien-z.png" width="769" height="811"/>
 </tile>
 <tile id="461">
  <properties>
    <property name="naam" value="wit-kapel-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x18"/>
    <property name="deur" value="6,2"/>
  </properties>
  <image source="huizen/wit-kapel-leien-o.png" width="771" height="997"/>
 </tile>
 <tile id="462">
  <properties>
    <property name="naam" value="wit-kapel-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="18x6"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/wit-kapel-leien-n.png" width="769" height="1000"/>
 </tile>
 <tile id="463">
  <properties>
    <property name="naam" value="wit-kapel-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x18"/>
    <property name="deur" value="-1,14"/>
  </properties>
  <image source="huizen/wit-kapel-leien-w.png" width="771" height="811"/>
 </tile>
 <tile id="464">
  <properties>
    <property name="naam" value="wit-kapel-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="18x6"/>
    <property name="deur" value="14,6"/>
  </properties>
  <image source="huizen/wit-kapel-baksteen-z.png" width="769" height="811"/>
 </tile>
 <tile id="465">
  <properties>
    <property name="naam" value="wit-kapel-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x18"/>
    <property name="deur" value="6,2"/>
  </properties>
  <image source="huizen/wit-kapel-baksteen-o.png" width="771" height="997"/>
 </tile>
 <tile id="466">
  <properties>
    <property name="naam" value="wit-kapel-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="18x6"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/wit-kapel-baksteen-n.png" width="769" height="1000"/>
 </tile>
 <tile id="467">
  <properties>
    <property name="naam" value="wit-kapel-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x18"/>
    <property name="deur" value="-1,14"/>
  </properties>
  <image source="huizen/wit-kapel-baksteen-w.png" width="771" height="811"/>
 </tile>
 <tile id="468">
  <properties>
    <property name="naam" value="wit-woontoren-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/wit-woontoren-pannen-z.png" width="421" height="579"/>
 </tile>
 <tile id="469">
  <properties>
    <property name="naam" value="wit-woontoren-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="5,2"/>
  </properties>
  <image source="huizen/wit-woontoren-pannen-o.png" width="421" height="574"/>
 </tile>
 <tile id="470">
  <properties>
    <property name="naam" value="wit-woontoren-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/wit-woontoren-pannen-n.png" width="421" height="574"/>
 </tile>
 <tile id="471">
  <properties>
    <property name="naam" value="wit-woontoren-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/wit-woontoren-pannen-w.png" width="421" height="588"/>
 </tile>
 <tile id="472">
  <properties>
    <property name="naam" value="wit-woontoren-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/wit-woontoren-baksteen-z.png" width="421" height="579"/>
 </tile>
 <tile id="473">
  <properties>
    <property name="naam" value="wit-woontoren-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="5,2"/>
  </properties>
  <image source="huizen/wit-woontoren-baksteen-o.png" width="421" height="574"/>
 </tile>
 <tile id="474">
  <properties>
    <property name="naam" value="wit-woontoren-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/wit-woontoren-baksteen-n.png" width="421" height="574"/>
 </tile>
 <tile id="475">
  <properties>
    <property name="naam" value="wit-woontoren-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/wit-woontoren-baksteen-w.png" width="421" height="588"/>
 </tile>
 <tile id="476">
  <properties>
    <property name="naam" value="wit-schoutshuis-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/wit-schoutshuis-riet-z.png" width="585" height="780"/>
 </tile>
 <tile id="477">
  <properties>
    <property name="naam" value="wit-schoutshuis-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,3"/>
  </properties>
  <image source="huizen/wit-schoutshuis-riet-o.png" width="585" height="770"/>
 </tile>
 <tile id="478">
  <properties>
    <property name="naam" value="wit-schoutshuis-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/wit-schoutshuis-riet-n.png" width="585" height="770"/>
 </tile>
 <tile id="479">
  <properties>
    <property name="naam" value="wit-schoutshuis-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/wit-schoutshuis-riet-w.png" width="585" height="780"/>
 </tile>
 <tile id="480">
  <properties>
    <property name="naam" value="oker-herberg1-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="11x8"/>
    <property name="deur" value="5,8"/>
  </properties>
  <image source="huizen/oker-herberg1-riet-z.png" width="610" height="629"/>
 </tile>
 <tile id="481">
  <properties>
    <property name="naam" value="oker-herberg1-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x11"/>
    <property name="deur" value="8,5"/>
  </properties>
  <image source="huizen/oker-herberg1-riet-o.png" width="623" height="629"/>
 </tile>
 <tile id="482">
  <properties>
    <property name="naam" value="oker-herberg1-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="11x8"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/oker-herberg1-riet-n.png" width="610" height="635"/>
 </tile>
 <tile id="483">
  <properties>
    <property name="naam" value="oker-herberg1-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x11"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/oker-herberg1-riet-w.png" width="623" height="629"/>
 </tile>
 <tile id="484">
  <properties>
    <property name="naam" value="oker-herberg2-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="5,6"/>
  </properties>
  <image source="huizen/oker-herberg2-leien-z.png" width="683" height="750"/>
 </tile>
 <tile id="485">
  <properties>
    <property name="naam" value="oker-herberg2-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="6,6"/>
  </properties>
  <image source="huizen/oker-herberg2-leien-o.png" width="683" height="750"/>
 </tile>
 <tile id="486">
  <properties>
    <property name="naam" value="oker-herberg2-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="6,-1"/>
  </properties>
  <image source="huizen/oker-herberg2-leien-n.png" width="683" height="750"/>
 </tile>
 <tile id="487">
  <properties>
    <property name="naam" value="oker-herberg2-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/oker-herberg2-leien-w.png" width="683" height="750"/>
 </tile>
 <tile id="488">
  <properties>
    <property name="naam" value="oker-herberg2-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="5,6"/>
  </properties>
  <image source="huizen/oker-herberg2-pannen-z.png" width="683" height="706"/>
 </tile>
 <tile id="489">
  <properties>
    <property name="naam" value="oker-herberg2-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="6,6"/>
  </properties>
  <image source="huizen/oker-herberg2-pannen-o.png" width="683" height="705"/>
 </tile>
 <tile id="490">
  <properties>
    <property name="naam" value="oker-herberg2-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="6,-1"/>
  </properties>
  <image source="huizen/oker-herberg2-pannen-n.png" width="683" height="705"/>
 </tile>
 <tile id="491">
  <properties>
    <property name="naam" value="oker-herberg2-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/oker-herberg2-pannen-w.png" width="683" height="706"/>
 </tile>
 <tile id="492">
  <properties>
    <property name="naam" value="oker-kapel-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="17x6"/>
    <property name="deur" value="14,6"/>
  </properties>
  <image source="huizen/oker-kapel-leien-z.png" width="729" height="1086"/>
 </tile>
 <tile id="493">
  <properties>
    <property name="naam" value="oker-kapel-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x17"/>
    <property name="deur" value="6,2"/>
  </properties>
  <image source="huizen/oker-kapel-leien-o.png" width="735" height="1292"/>
 </tile>
 <tile id="494">
  <properties>
    <property name="naam" value="oker-kapel-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="17x6"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/oker-kapel-leien-n.png" width="729" height="1295"/>
 </tile>
 <tile id="495">
  <properties>
    <property name="naam" value="oker-kapel-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x17"/>
    <property name="deur" value="-1,14"/>
  </properties>
  <image source="huizen/oker-kapel-leien-w.png" width="735" height="1089"/>
 </tile>
 <tile id="496">
  <properties>
    <property name="naam" value="oker-kapel-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="17x6"/>
    <property name="deur" value="14,6"/>
  </properties>
  <image source="huizen/oker-kapel-baksteen-z.png" width="729" height="1086"/>
 </tile>
 <tile id="497">
  <properties>
    <property name="naam" value="oker-kapel-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x17"/>
    <property name="deur" value="6,2"/>
  </properties>
  <image source="huizen/oker-kapel-baksteen-o.png" width="735" height="1292"/>
 </tile>
 <tile id="498">
  <properties>
    <property name="naam" value="oker-kapel-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="17x6"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/oker-kapel-baksteen-n.png" width="729" height="1295"/>
 </tile>
 <tile id="499">
  <properties>
    <property name="naam" value="oker-kapel-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x17"/>
    <property name="deur" value="-1,14"/>
  </properties>
  <image source="huizen/oker-kapel-baksteen-w.png" width="735" height="1089"/>
 </tile>
 <tile id="500">
  <properties>
    <property name="naam" value="oker-woontoren-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/oker-woontoren-pannen-z.png" width="421" height="579"/>
 </tile>
 <tile id="501">
  <properties>
    <property name="naam" value="oker-woontoren-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="5,2"/>
  </properties>
  <image source="huizen/oker-woontoren-pannen-o.png" width="421" height="574"/>
 </tile>
 <tile id="502">
  <properties>
    <property name="naam" value="oker-woontoren-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/oker-woontoren-pannen-n.png" width="421" height="574"/>
 </tile>
 <tile id="503">
  <properties>
    <property name="naam" value="oker-woontoren-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/oker-woontoren-pannen-w.png" width="421" height="588"/>
 </tile>
 <tile id="504">
  <properties>
    <property name="naam" value="oker-woontoren-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/oker-woontoren-baksteen-z.png" width="421" height="579"/>
 </tile>
 <tile id="505">
  <properties>
    <property name="naam" value="oker-woontoren-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="5,2"/>
  </properties>
  <image source="huizen/oker-woontoren-baksteen-o.png" width="421" height="574"/>
 </tile>
 <tile id="506">
  <properties>
    <property name="naam" value="oker-woontoren-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/oker-woontoren-baksteen-n.png" width="421" height="574"/>
 </tile>
 <tile id="507">
  <properties>
    <property name="naam" value="oker-woontoren-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/oker-woontoren-baksteen-w.png" width="421" height="588"/>
 </tile>
 <tile id="508">
  <properties>
    <property name="naam" value="oker-schoutshuis-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/oker-schoutshuis-riet-z.png" width="585" height="780"/>
 </tile>
 <tile id="509">
  <properties>
    <property name="naam" value="oker-schoutshuis-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,3"/>
  </properties>
  <image source="huizen/oker-schoutshuis-riet-o.png" width="585" height="770"/>
 </tile>
 <tile id="510">
  <properties>
    <property name="naam" value="oker-schoutshuis-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-schoutshuis-riet-n.png" width="585" height="770"/>
 </tile>
 <tile id="511">
  <properties>
    <property name="naam" value="oker-schoutshuis-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/oker-schoutshuis-riet-w.png" width="585" height="780"/>
 </tile>
 <tile id="512">
  <properties>
    <property name="naam" value="planken-herberg1-spanen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="11x8"/>
    <property name="deur" value="5,8"/>
  </properties>
  <image source="huizen/planken-herberg1-spanen-z.png" width="576" height="576"/>
 </tile>
 <tile id="513">
  <properties>
    <property name="naam" value="planken-herberg1-spanen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x11"/>
    <property name="deur" value="8,5"/>
  </properties>
  <image source="huizen/planken-herberg1-spanen-o.png" width="590" height="576"/>
 </tile>
 <tile id="514">
  <properties>
    <property name="naam" value="planken-herberg1-spanen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="11x8"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/planken-herberg1-spanen-n.png" width="576" height="582"/>
 </tile>
 <tile id="515">
  <properties>
    <property name="naam" value="planken-herberg1-spanen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x11"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/planken-herberg1-spanen-w.png" width="590" height="576"/>
 </tile>
 <tile id="516">
  <properties>
    <property name="naam" value="planken-herberg2-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="5,6"/>
  </properties>
  <image source="huizen/planken-herberg2-leien-z.png" width="683" height="750"/>
 </tile>
 <tile id="517">
  <properties>
    <property name="naam" value="planken-herberg2-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="6,6"/>
  </properties>
  <image source="huizen/planken-herberg2-leien-o.png" width="683" height="750"/>
 </tile>
 <tile id="518">
  <properties>
    <property name="naam" value="planken-herberg2-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="6,-1"/>
  </properties>
  <image source="huizen/planken-herberg2-leien-n.png" width="683" height="750"/>
 </tile>
 <tile id="519">
  <properties>
    <property name="naam" value="planken-herberg2-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/planken-herberg2-leien-w.png" width="683" height="750"/>
 </tile>
 <tile id="520">
  <properties>
    <property name="naam" value="planken-herberg2-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="5,6"/>
  </properties>
  <image source="huizen/planken-herberg2-pannen-z.png" width="683" height="706"/>
 </tile>
 <tile id="521">
  <properties>
    <property name="naam" value="planken-herberg2-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="6,6"/>
  </properties>
  <image source="huizen/planken-herberg2-pannen-o.png" width="683" height="705"/>
 </tile>
 <tile id="522">
  <properties>
    <property name="naam" value="planken-herberg2-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="6,-1"/>
  </properties>
  <image source="huizen/planken-herberg2-pannen-n.png" width="683" height="705"/>
 </tile>
 <tile id="523">
  <properties>
    <property name="naam" value="planken-herberg2-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/planken-herberg2-pannen-w.png" width="683" height="706"/>
 </tile>
 <tile id="524">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="525">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="526">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="527">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="528">
  <properties>
    <property name="naam" value="planken-kapel-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="17x6"/>
    <property name="deur" value="14,6"/>
  </properties>
  <image source="huizen/planken-kapel-baksteen-z.png" width="749" height="1086"/>
 </tile>
 <tile id="529">
  <properties>
    <property name="naam" value="planken-kapel-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x17"/>
    <property name="deur" value="6,2"/>
  </properties>
  <image source="huizen/planken-kapel-baksteen-o.png" width="755" height="1292"/>
 </tile>
 <tile id="530">
  <properties>
    <property name="naam" value="planken-kapel-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="17x6"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/planken-kapel-baksteen-n.png" width="749" height="1295"/>
 </tile>
 <tile id="531">
  <properties>
    <property name="naam" value="planken-kapel-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x17"/>
    <property name="deur" value="-1,14"/>
  </properties>
  <image source="huizen/planken-kapel-baksteen-w.png" width="755" height="1089"/>
 </tile>
 <tile id="532">
  <properties>
    <property name="naam" value="planken-woontoren-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/planken-woontoren-pannen-z.png" width="421" height="579"/>
 </tile>
 <tile id="533">
  <properties>
    <property name="naam" value="planken-woontoren-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="5,2"/>
  </properties>
  <image source="huizen/planken-woontoren-pannen-o.png" width="421" height="574"/>
 </tile>
 <tile id="534">
  <properties>
    <property name="naam" value="planken-woontoren-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/planken-woontoren-pannen-n.png" width="421" height="574"/>
 </tile>
 <tile id="535">
  <properties>
    <property name="naam" value="planken-woontoren-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/planken-woontoren-pannen-w.png" width="421" height="588"/>
 </tile>
 <tile id="536">
  <properties>
    <property name="naam" value="planken-woontoren-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/planken-woontoren-baksteen-z.png" width="421" height="579"/>
 </tile>
 <tile id="537">
  <properties>
    <property name="naam" value="planken-woontoren-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="5,2"/>
  </properties>
  <image source="huizen/planken-woontoren-baksteen-o.png" width="421" height="574"/>
 </tile>
 <tile id="538">
  <properties>
    <property name="naam" value="planken-woontoren-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/planken-woontoren-baksteen-n.png" width="421" height="574"/>
 </tile>
 <tile id="539">
  <properties>
    <property name="naam" value="planken-woontoren-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/planken-woontoren-baksteen-w.png" width="421" height="588"/>
 </tile>
 <tile id="540">
  <properties>
    <property name="naam" value="planken-schoutshuis-spanen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/planken-schoutshuis-spanen-z.png" width="551" height="733"/>
 </tile>
 <tile id="541">
  <properties>
    <property name="naam" value="planken-schoutshuis-spanen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,3"/>
  </properties>
  <image source="huizen/planken-schoutshuis-spanen-o.png" width="552" height="724"/>
 </tile>
 <tile id="542">
  <properties>
    <property name="naam" value="planken-schoutshuis-spanen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/planken-schoutshuis-spanen-n.png" width="552" height="724"/>
 </tile>
 <tile id="543">
  <properties>
    <property name="naam" value="planken-schoutshuis-spanen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-schoutshuis-spanen-w.png" width="551" height="733"/>
 </tile>
 <tile id="544">
  <properties>
    <property name="naam" value="roze-herberg1-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="11x8"/>
    <property name="deur" value="5,8"/>
  </properties>
  <image source="huizen/roze-herberg1-riet-z.png" width="610" height="629"/>
 </tile>
 <tile id="545">
  <properties>
    <property name="naam" value="roze-herberg1-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x11"/>
    <property name="deur" value="8,5"/>
  </properties>
  <image source="huizen/roze-herberg1-riet-o.png" width="623" height="629"/>
 </tile>
 <tile id="546">
  <properties>
    <property name="naam" value="roze-herberg1-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="11x8"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/roze-herberg1-riet-n.png" width="610" height="635"/>
 </tile>
 <tile id="547">
  <properties>
    <property name="naam" value="roze-herberg1-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x11"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/roze-herberg1-riet-w.png" width="623" height="629"/>
 </tile>
 <tile id="548">
  <properties>
    <property name="naam" value="roze-herberg2-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="5,6"/>
  </properties>
  <image source="huizen/roze-herberg2-leien-z.png" width="683" height="750"/>
 </tile>
 <tile id="549">
  <properties>
    <property name="naam" value="roze-herberg2-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="6,6"/>
  </properties>
  <image source="huizen/roze-herberg2-leien-o.png" width="683" height="750"/>
 </tile>
 <tile id="550">
  <properties>
    <property name="naam" value="roze-herberg2-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="6,-1"/>
  </properties>
  <image source="huizen/roze-herberg2-leien-n.png" width="683" height="750"/>
 </tile>
 <tile id="551">
  <properties>
    <property name="naam" value="roze-herberg2-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/roze-herberg2-leien-w.png" width="683" height="750"/>
 </tile>
 <tile id="552">
  <properties>
    <property name="naam" value="roze-herberg2-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="5,6"/>
  </properties>
  <image source="huizen/roze-herberg2-pannen-z.png" width="683" height="706"/>
 </tile>
 <tile id="553">
  <properties>
    <property name="naam" value="roze-herberg2-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="6,6"/>
  </properties>
  <image source="huizen/roze-herberg2-pannen-o.png" width="683" height="705"/>
 </tile>
 <tile id="554">
  <properties>
    <property name="naam" value="roze-herberg2-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="6,-1"/>
  </properties>
  <image source="huizen/roze-herberg2-pannen-n.png" width="683" height="705"/>
 </tile>
 <tile id="555">
  <properties>
    <property name="naam" value="roze-herberg2-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/roze-herberg2-pannen-w.png" width="683" height="706"/>
 </tile>
 <tile id="556">
  <properties>
    <property name="naam" value="roze-kapel-leien-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="18x6"/>
    <property name="deur" value="14,6"/>
  </properties>
  <image source="huizen/roze-kapel-leien-z.png" width="769" height="811"/>
 </tile>
 <tile id="557">
  <properties>
    <property name="naam" value="roze-kapel-leien-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x18"/>
    <property name="deur" value="6,2"/>
  </properties>
  <image source="huizen/roze-kapel-leien-o.png" width="771" height="997"/>
 </tile>
 <tile id="558">
  <properties>
    <property name="naam" value="roze-kapel-leien-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="18x6"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/roze-kapel-leien-n.png" width="769" height="1000"/>
 </tile>
 <tile id="559">
  <properties>
    <property name="naam" value="roze-kapel-leien-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x18"/>
    <property name="deur" value="-1,14"/>
  </properties>
  <image source="huizen/roze-kapel-leien-w.png" width="771" height="811"/>
 </tile>
 <tile id="560">
  <properties>
    <property name="naam" value="roze-kapel-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="18x6"/>
    <property name="deur" value="14,6"/>
  </properties>
  <image source="huizen/roze-kapel-baksteen-z.png" width="769" height="811"/>
 </tile>
 <tile id="561">
  <properties>
    <property name="naam" value="roze-kapel-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x18"/>
    <property name="deur" value="6,2"/>
  </properties>
  <image source="huizen/roze-kapel-baksteen-o.png" width="771" height="997"/>
 </tile>
 <tile id="562">
  <properties>
    <property name="naam" value="roze-kapel-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="18x6"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/roze-kapel-baksteen-n.png" width="769" height="1000"/>
 </tile>
 <tile id="563">
  <properties>
    <property name="naam" value="roze-kapel-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x18"/>
    <property name="deur" value="-1,14"/>
  </properties>
  <image source="huizen/roze-kapel-baksteen-w.png" width="771" height="811"/>
 </tile>
 <tile id="564">
  <properties>
    <property name="naam" value="roze-woontoren-pannen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/roze-woontoren-pannen-z.png" width="421" height="579"/>
 </tile>
 <tile id="565">
  <properties>
    <property name="naam" value="roze-woontoren-pannen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="5,2"/>
  </properties>
  <image source="huizen/roze-woontoren-pannen-o.png" width="421" height="574"/>
 </tile>
 <tile id="566">
  <properties>
    <property name="naam" value="roze-woontoren-pannen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/roze-woontoren-pannen-n.png" width="421" height="574"/>
 </tile>
 <tile id="567">
  <properties>
    <property name="naam" value="roze-woontoren-pannen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/roze-woontoren-pannen-w.png" width="421" height="588"/>
 </tile>
 <tile id="568">
  <properties>
    <property name="naam" value="roze-woontoren-baksteen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/roze-woontoren-baksteen-z.png" width="421" height="579"/>
 </tile>
 <tile id="569">
  <properties>
    <property name="naam" value="roze-woontoren-baksteen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="5,2"/>
  </properties>
  <image source="huizen/roze-woontoren-baksteen-o.png" width="421" height="574"/>
 </tile>
 <tile id="570">
  <properties>
    <property name="naam" value="roze-woontoren-baksteen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/roze-woontoren-baksteen-n.png" width="421" height="574"/>
 </tile>
 <tile id="571">
  <properties>
    <property name="naam" value="roze-woontoren-baksteen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/roze-woontoren-baksteen-w.png" width="421" height="588"/>
 </tile>
 <tile id="572">
  <properties>
    <property name="naam" value="roze-schoutshuis-riet-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/roze-schoutshuis-riet-z.png" width="585" height="780"/>
 </tile>
 <tile id="573">
  <properties>
    <property name="naam" value="roze-schoutshuis-riet-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,3"/>
  </properties>
  <image source="huizen/roze-schoutshuis-riet-o.png" width="585" height="770"/>
 </tile>
 <tile id="574">
  <properties>
    <property name="naam" value="roze-schoutshuis-riet-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/roze-schoutshuis-riet-n.png" width="585" height="770"/>
 </tile>
 <tile id="575">
  <properties>
    <property name="naam" value="roze-schoutshuis-riet-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-schoutshuis-riet-w.png" width="585" height="780"/>
 </tile>
 <tile id="576">
  <properties>
    <property name="naam" value="planken-kapel-spanen-z"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="17x6"/>
    <property name="deur" value="14,6"/>
  </properties>
  <image source="huizen/planken-kapel-spanen-z.png" width="749" height="1086"/>
 </tile>
 <tile id="577">
  <properties>
    <property name="naam" value="planken-kapel-spanen-o"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x17"/>
    <property name="deur" value="6,2"/>
  </properties>
  <image source="huizen/planken-kapel-spanen-o.png" width="755" height="1292"/>
 </tile>
 <tile id="578">
  <properties>
    <property name="naam" value="planken-kapel-spanen-n"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="17x6"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/planken-kapel-spanen-n.png" width="749" height="1295"/>
 </tile>
 <tile id="579">
  <properties>
    <property name="naam" value="planken-kapel-spanen-w"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x17"/>
    <property name="deur" value="-1,14"/>
  </properties>
  <image source="huizen/planken-kapel-spanen-w.png" width="755" height="1089"/>
 </tile>
 <tile id="580">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="581">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="582">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="583">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="584">
  <properties>
    <property name="naam" value="hut1-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x4"/>
    <property name="deur" value="2,4"/>
  </properties>
  <image source="huizen/hut1-oud.png" width="382" height="411"/>
 </tile>
 <tile id="585">
  <properties>
    <property name="naam" value="hut2-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="4x5"/>
    <property name="deur" value="4,2"/>
  </properties>
  <image source="huizen/hut2-oud.png" width="382" height="400"/>
 </tile>
 <tile id="586">
  <properties>
    <property name="naam" value="hut3-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x4"/>
    <property name="deur" value="2,4"/>
  </properties>
  <image source="huizen/hut3-oud.png" width="413" height="424"/>
 </tile>
 <tile id="587">
  <properties>
    <property name="naam" value="hut4-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x6"/>
    <property name="deur" value="2,6"/>
  </properties>
  <image source="huizen/hut4-oud.png" width="415" height="446"/>
 </tile>
 <tile id="588">
  <properties>
    <property name="naam" value="huis1-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/huis1-oud.png" width="478" height="558"/>
 </tile>
 <tile id="589">
  <properties>
    <property name="naam" value="huis2-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,2"/>
  </properties>
  <image source="huizen/huis2-oud.png" width="479" height="614"/>
 </tile>
 <tile id="590">
  <properties>
    <property name="naam" value="huis3-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/huis3-oud.png" width="511" height="569"/>
 </tile>
 <tile id="591">
  <properties>
    <property name="naam" value="huis4-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="3,8"/>
  </properties>
  <image source="huizen/huis4-oud.png" width="514" height="610"/>
 </tile>
 <tile id="592">
  <properties>
    <property name="naam" value="huis5-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,5"/>
  </properties>
  <image source="huizen/huis5-oud.png" width="446" height="575"/>
 </tile>
 <tile id="593">
  <properties>
    <property name="naam" value="huis6-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="2,9"/>
  </properties>
  <image source="huizen/huis6-oud.png" width="550" height="580"/>
 </tile>
 <tile id="594">
  <properties>
    <property name="naam" value="steen1-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/steen1-oud.png" width="478" height="558"/>
 </tile>
 <tile id="595">
  <properties>
    <property name="naam" value="steen2-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,2"/>
  </properties>
  <image source="huizen/steen2-oud.png" width="479" height="614"/>
 </tile>
 <tile id="596">
  <properties>
    <property name="naam" value="steen3-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="8,2"/>
  </properties>
  <image source="huizen/steen3-oud.png" width="511" height="569"/>
 </tile>
 <tile id="597">
  <properties>
    <property name="naam" value="steen4-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="3,8"/>
  </properties>
  <image source="huizen/steen4-oud.png" width="514" height="610"/>
 </tile>
 <tile id="598">
  <properties>
    <property name="naam" value="steen5-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,5"/>
  </properties>
  <image source="huizen/steen5-oud.png" width="446" height="575"/>
 </tile>
 <tile id="599">
  <properties>
    <property name="naam" value="steen6-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="2,9"/>
  </properties>
  <image source="huizen/steen6-oud.png" width="550" height="580"/>
 </tile>
 <tile id="600">
  <properties>
    <property name="naam" value="boerderij1-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,3"/>
  </properties>
  <image source="huizen/boerderij1-oud.png" width="609" height="579"/>
 </tile>
 <tile id="601">
  <properties>
    <property name="naam" value="boerderij2-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="5,8"/>
  </properties>
  <image source="huizen/boerderij2-oud.png" width="543" height="579"/>
 </tile>
 <tile id="602">
  <properties>
    <property name="naam" value="boerderij3-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/boerderij3-oud.png" width="575" height="687"/>
 </tile>
 <tile id="603">
  <properties>
    <property name="naam" value="boerderij4-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/boerderij4-oud.png" width="544" height="608"/>
 </tile>
 <tile id="604">
  <properties>
    <property name="naam" value="boerderij5-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="6,4"/>
  </properties>
  <image source="huizen/boerderij5-oud.png" width="508" height="520"/>
 </tile>
 <tile id="605">
  <properties>
    <property name="naam" value="schoutshuis-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/schoutshuis-oud.png" width="585" height="765"/>
 </tile>
 <tile id="606">
  <properties>
    <property name="naam" value="herberg1-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x11"/>
    <property name="deur" value="8,5"/>
  </properties>
  <image source="huizen/herberg1-oud.png" width="606" height="613"/>
 </tile>
 <tile id="607">
  <properties>
    <property name="naam" value="wit-hut1-riet-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x4"/>
    <property name="deur" value="2,4"/>
  </properties>
  <image source="huizen/wit-hut1-riet-z-oud.png" width="386" height="425"/>
 </tile>
 <tile id="608">
  <properties>
    <property name="naam" value="wit-hut1-riet-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="4x6"/>
    <property name="deur" value="4,3"/>
  </properties>
  <image source="huizen/wit-hut1-riet-o-oud.png" width="386" height="415"/>
 </tile>
 <tile id="609">
  <properties>
    <property name="naam" value="wit-hut1-riet-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x4"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/wit-hut1-riet-n-oud.png" width="386" height="415"/>
 </tile>
 <tile id="610">
  <properties>
    <property name="naam" value="wit-hut1-riet-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="4x6"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/wit-hut1-riet-w-oud.png" width="386" height="427"/>
 </tile>
 <tile id="611">
  <properties>
    <property name="naam" value="wit-hut3-riet-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x4"/>
    <property name="deur" value="3,4"/>
  </properties>
  <image source="huizen/wit-hut3-riet-z-oud.png" width="418" height="439"/>
 </tile>
 <tile id="612">
  <properties>
    <property name="naam" value="wit-hut3-riet-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="4x6"/>
    <property name="deur" value="4,2"/>
  </properties>
  <image source="huizen/wit-hut3-riet-o-oud.png" width="418" height="434"/>
 </tile>
 <tile id="613">
  <properties>
    <property name="naam" value="wit-hut3-riet-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x4"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/wit-hut3-riet-n-oud.png" width="418" height="434"/>
 </tile>
 <tile id="614">
  <properties>
    <property name="naam" value="wit-hut3-riet-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="4x6"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/wit-hut3-riet-w-oud.png" width="418" height="439"/>
 </tile>
 <tile id="615">
  <properties>
    <property name="naam" value="wit-hut4-riet-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x6"/>
    <property name="deur" value="5,6"/>
  </properties>
  <image source="huizen/wit-hut4-riet-z-oud.png" width="418" height="467"/>
 </tile>
 <tile id="616">
  <properties>
    <property name="naam" value="wit-hut4-riet-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x6"/>
    <property name="deur" value="6,0"/>
  </properties>
  <image source="huizen/wit-hut4-riet-o-oud.png" width="484" height="396"/>
 </tile>
 <tile id="617">
  <properties>
    <property name="naam" value="wit-hut4-riet-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x6"/>
    <property name="deur" value="0,-1"/>
  </properties>
  <image source="huizen/wit-hut4-riet-n-oud.png" width="418" height="471"/>
 </tile>
 <tile id="618">
  <properties>
    <property name="naam" value="wit-hut4-riet-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x6"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/wit-hut4-riet-w-oud.png" width="484" height="429"/>
 </tile>
 <tile id="619">
  <properties>
    <property name="naam" value="wit-huis1-riet-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/wit-huis1-riet-z-oud.png" width="482" height="573"/>
 </tile>
 <tile id="620">
  <properties>
    <property name="naam" value="wit-huis1-riet-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/wit-huis1-riet-o-oud.png" width="482" height="575"/>
 </tile>
 <tile id="621">
  <properties>
    <property name="naam" value="wit-huis1-riet-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/wit-huis1-riet-n-oud.png" width="482" height="575"/>
 </tile>
 <tile id="622">
  <properties>
    <property name="naam" value="wit-huis1-riet-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/wit-huis1-riet-w-oud.png" width="482" height="573"/>
 </tile>
 <tile id="623">
  <properties>
    <property name="naam" value="wit-huis1-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/wit-huis1-leien-z-oud.png" width="447" height="525"/>
 </tile>
 <tile id="624">
  <properties>
    <property name="naam" value="wit-huis1-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/wit-huis1-leien-o-oud.png" width="447" height="527"/>
 </tile>
 <tile id="625">
  <properties>
    <property name="naam" value="wit-huis1-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/wit-huis1-leien-n-oud.png" width="447" height="527"/>
 </tile>
 <tile id="626">
  <properties>
    <property name="naam" value="wit-huis1-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/wit-huis1-leien-w-oud.png" width="447" height="531"/>
 </tile>
 <tile id="627">
  <properties>
    <property name="naam" value="wit-huis1-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/wit-huis1-pannen-z-oud.png" width="447" height="525"/>
 </tile>
 <tile id="628">
  <properties>
    <property name="naam" value="wit-huis1-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/wit-huis1-pannen-o-oud.png" width="447" height="527"/>
 </tile>
 <tile id="629">
  <properties>
    <property name="naam" value="wit-huis1-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/wit-huis1-pannen-n-oud.png" width="447" height="527"/>
 </tile>
 <tile id="630">
  <properties>
    <property name="naam" value="wit-huis1-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/wit-huis1-pannen-w-oud.png" width="447" height="531"/>
 </tile>
 <tile id="631">
  <properties>
    <property name="naam" value="wit-steen1-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/wit-steen1-leien-z-oud.png" width="447" height="525"/>
 </tile>
 <tile id="632">
  <properties>
    <property name="naam" value="wit-steen1-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/wit-steen1-leien-o-oud.png" width="447" height="527"/>
 </tile>
 <tile id="633">
  <properties>
    <property name="naam" value="wit-steen1-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/wit-steen1-leien-n-oud.png" width="447" height="527"/>
 </tile>
 <tile id="634">
  <properties>
    <property name="naam" value="wit-steen1-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/wit-steen1-leien-w-oud.png" width="447" height="531"/>
 </tile>
 <tile id="635">
  <properties>
    <property name="naam" value="wit-steen1-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/wit-steen1-pannen-z-oud.png" width="447" height="525"/>
 </tile>
 <tile id="636">
  <properties>
    <property name="naam" value="wit-steen1-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/wit-steen1-pannen-o-oud.png" width="447" height="527"/>
 </tile>
 <tile id="637">
  <properties>
    <property name="naam" value="wit-steen1-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/wit-steen1-pannen-n-oud.png" width="447" height="527"/>
 </tile>
 <tile id="638">
  <properties>
    <property name="naam" value="wit-steen1-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/wit-steen1-pannen-w-oud.png" width="447" height="531"/>
 </tile>
 <tile id="639">
  <properties>
    <property name="naam" value="wit-steen1-baksteen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/wit-steen1-baksteen-z-oud.png" width="447" height="525"/>
 </tile>
 <tile id="640">
  <properties>
    <property name="naam" value="wit-steen1-baksteen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/wit-steen1-baksteen-o-oud.png" width="447" height="527"/>
 </tile>
 <tile id="641">
  <properties>
    <property name="naam" value="wit-steen1-baksteen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/wit-steen1-baksteen-n-oud.png" width="447" height="527"/>
 </tile>
 <tile id="642">
  <properties>
    <property name="naam" value="wit-steen1-baksteen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/wit-steen1-baksteen-w-oud.png" width="447" height="531"/>
 </tile>
 <tile id="643">
  <properties>
    <property name="naam" value="wit-huis3-riet-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/wit-huis3-riet-z-oud.png" width="514" height="584"/>
 </tile>
 <tile id="644">
  <properties>
    <property name="naam" value="wit-huis3-riet-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,2"/>
  </properties>
  <image source="huizen/wit-huis3-riet-o-oud.png" width="539" height="560"/>
 </tile>
 <tile id="645">
  <properties>
    <property name="naam" value="wit-huis3-riet-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/wit-huis3-riet-n-oud.png" width="514" height="560"/>
 </tile>
 <tile id="646">
  <properties>
    <property name="naam" value="wit-huis3-riet-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/wit-huis3-riet-w-oud.png" width="540" height="558"/>
 </tile>
 <tile id="647">
  <properties>
    <property name="naam" value="wit-huis3-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/wit-huis3-leien-z-oud.png" width="481" height="536"/>
 </tile>
 <tile id="648">
  <properties>
    <property name="naam" value="wit-huis3-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,2"/>
  </properties>
  <image source="huizen/wit-huis3-leien-o-oud.png" width="521" height="513"/>
 </tile>
 <tile id="649">
  <properties>
    <property name="naam" value="wit-huis3-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/wit-huis3-leien-n-oud.png" width="481" height="513"/>
 </tile>
 <tile id="650">
  <properties>
    <property name="naam" value="wit-huis3-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/wit-huis3-leien-w-oud.png" width="521" height="510"/>
 </tile>
 <tile id="651">
  <properties>
    <property name="naam" value="wit-huis3-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/wit-huis3-pannen-z-oud.png" width="481" height="536"/>
 </tile>
 <tile id="652">
  <properties>
    <property name="naam" value="wit-huis3-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,2"/>
  </properties>
  <image source="huizen/wit-huis3-pannen-o-oud.png" width="521" height="513"/>
 </tile>
 <tile id="653">
  <properties>
    <property name="naam" value="wit-huis3-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/wit-huis3-pannen-n-oud.png" width="481" height="513"/>
 </tile>
 <tile id="654">
  <properties>
    <property name="naam" value="wit-huis3-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/wit-huis3-pannen-w-oud.png" width="521" height="510"/>
 </tile>
 <tile id="655">
  <properties>
    <property name="naam" value="wit-steen3-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/wit-steen3-leien-z-oud.png" width="481" height="536"/>
 </tile>
 <tile id="656">
  <properties>
    <property name="naam" value="wit-steen3-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="7,1"/>
  </properties>
  <image source="huizen/wit-steen3-leien-o-oud.png" width="521" height="513"/>
 </tile>
 <tile id="657">
  <properties>
    <property name="naam" value="wit-steen3-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="1,-1"/>
  </properties>
  <image source="huizen/wit-steen3-leien-n-oud.png" width="481" height="513"/>
 </tile>
 <tile id="658">
  <properties>
    <property name="naam" value="wit-steen3-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/wit-steen3-leien-w-oud.png" width="521" height="510"/>
 </tile>
 <tile id="659">
  <properties>
    <property name="naam" value="wit-steen3-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/wit-steen3-pannen-z-oud.png" width="481" height="536"/>
 </tile>
 <tile id="660">
  <properties>
    <property name="naam" value="wit-steen3-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="7,1"/>
  </properties>
  <image source="huizen/wit-steen3-pannen-o-oud.png" width="521" height="513"/>
 </tile>
 <tile id="661">
  <properties>
    <property name="naam" value="wit-steen3-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="1,-1"/>
  </properties>
  <image source="huizen/wit-steen3-pannen-n-oud.png" width="481" height="513"/>
 </tile>
 <tile id="662">
  <properties>
    <property name="naam" value="wit-steen3-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/wit-steen3-pannen-w-oud.png" width="521" height="510"/>
 </tile>
 <tile id="663">
  <properties>
    <property name="naam" value="wit-steen3-baksteen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/wit-steen3-baksteen-z-oud.png" width="481" height="536"/>
 </tile>
 <tile id="664">
  <properties>
    <property name="naam" value="wit-steen3-baksteen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="7,1"/>
  </properties>
  <image source="huizen/wit-steen3-baksteen-o-oud.png" width="521" height="513"/>
 </tile>
 <tile id="665">
  <properties>
    <property name="naam" value="wit-steen3-baksteen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="1,-1"/>
  </properties>
  <image source="huizen/wit-steen3-baksteen-n-oud.png" width="481" height="513"/>
 </tile>
 <tile id="666">
  <properties>
    <property name="naam" value="wit-steen3-baksteen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/wit-steen3-baksteen-w-oud.png" width="521" height="510"/>
 </tile>
 <tile id="667">
  <properties>
    <property name="naam" value="wit-huis6-riet-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="5,8"/>
  </properties>
  <image source="huizen/wit-huis6-riet-z-oud.png" width="546" height="589"/>
 </tile>
 <tile id="668">
  <properties>
    <property name="naam" value="wit-huis6-riet-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/wit-huis6-riet-o-oud.png" width="582" height="573"/>
 </tile>
 <tile id="669">
  <properties>
    <property name="naam" value="wit-huis6-riet-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/wit-huis6-riet-n-oud.png" width="546" height="573"/>
 </tile>
 <tile id="670">
  <properties>
    <property name="naam" value="wit-huis6-riet-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/wit-huis6-riet-w-oud.png" width="582" height="590"/>
 </tile>
 <tile id="671">
  <properties>
    <property name="naam" value="wit-huis6-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="5,8"/>
  </properties>
  <image source="huizen/wit-huis6-leien-z-oud.png" width="516" height="552"/>
 </tile>
 <tile id="672">
  <properties>
    <property name="naam" value="wit-huis6-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/wit-huis6-leien-o-oud.png" width="550" height="525"/>
 </tile>
 <tile id="673">
  <properties>
    <property name="naam" value="wit-huis6-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/wit-huis6-leien-n-oud.png" width="516" height="525"/>
 </tile>
 <tile id="674">
  <properties>
    <property name="naam" value="wit-huis6-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/wit-huis6-leien-w-oud.png" width="550" height="557"/>
 </tile>
 <tile id="675">
  <properties>
    <property name="naam" value="wit-huis6-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="5,8"/>
  </properties>
  <image source="huizen/wit-huis6-pannen-z-oud.png" width="516" height="552"/>
 </tile>
 <tile id="676">
  <properties>
    <property name="naam" value="wit-huis6-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/wit-huis6-pannen-o-oud.png" width="550" height="525"/>
 </tile>
 <tile id="677">
  <properties>
    <property name="naam" value="wit-huis6-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/wit-huis6-pannen-n-oud.png" width="516" height="525"/>
 </tile>
 <tile id="678">
  <properties>
    <property name="naam" value="wit-huis6-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/wit-huis6-pannen-w-oud.png" width="550" height="557"/>
 </tile>
 <tile id="679">
  <properties>
    <property name="naam" value="wit-steen6-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="5,8"/>
  </properties>
  <image source="huizen/wit-steen6-leien-z-oud.png" width="516" height="552"/>
 </tile>
 <tile id="680">
  <properties>
    <property name="naam" value="wit-steen6-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/wit-steen6-leien-o-oud.png" width="550" height="525"/>
 </tile>
 <tile id="681">
  <properties>
    <property name="naam" value="wit-steen6-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/wit-steen6-leien-n-oud.png" width="516" height="525"/>
 </tile>
 <tile id="682">
  <properties>
    <property name="naam" value="wit-steen6-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/wit-steen6-leien-w-oud.png" width="550" height="557"/>
 </tile>
 <tile id="683">
  <properties>
    <property name="naam" value="wit-steen6-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="5,8"/>
  </properties>
  <image source="huizen/wit-steen6-pannen-z-oud.png" width="516" height="552"/>
 </tile>
 <tile id="684">
  <properties>
    <property name="naam" value="wit-steen6-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/wit-steen6-pannen-o-oud.png" width="550" height="525"/>
 </tile>
 <tile id="685">
  <properties>
    <property name="naam" value="wit-steen6-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/wit-steen6-pannen-n-oud.png" width="516" height="525"/>
 </tile>
 <tile id="686">
  <properties>
    <property name="naam" value="wit-steen6-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/wit-steen6-pannen-w-oud.png" width="550" height="557"/>
 </tile>
 <tile id="687">
  <properties>
    <property name="naam" value="wit-steen6-baksteen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="5,8"/>
  </properties>
  <image source="huizen/wit-steen6-baksteen-z-oud.png" width="516" height="552"/>
 </tile>
 <tile id="688">
  <properties>
    <property name="naam" value="wit-steen6-baksteen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/wit-steen6-baksteen-o-oud.png" width="550" height="525"/>
 </tile>
 <tile id="689">
  <properties>
    <property name="naam" value="wit-steen6-baksteen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/wit-steen6-baksteen-n-oud.png" width="516" height="525"/>
 </tile>
 <tile id="690">
  <properties>
    <property name="naam" value="wit-steen6-baksteen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/wit-steen6-baksteen-w-oud.png" width="550" height="557"/>
 </tile>
 <tile id="691">
  <properties>
    <property name="naam" value="wit-boerderij1-riet-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/wit-boerderij1-riet-z-oud.png" width="608" height="594"/>
 </tile>
 <tile id="692">
  <properties>
    <property name="naam" value="wit-boerderij1-riet-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/wit-boerderij1-riet-o-oud.png" width="546" height="632"/>
 </tile>
 <tile id="693">
  <properties>
    <property name="naam" value="wit-boerderij1-riet-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/wit-boerderij1-riet-n-oud.png" width="608" height="552"/>
 </tile>
 <tile id="694">
  <properties>
    <property name="naam" value="wit-boerderij1-riet-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/wit-boerderij1-riet-w-oud.png" width="546" height="624"/>
 </tile>
 <tile id="695">
  <properties>
    <property name="naam" value="wit-boerderij1-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/wit-boerderij1-leien-z-oud.png" width="574" height="546"/>
 </tile>
 <tile id="696">
  <properties>
    <property name="naam" value="wit-boerderij1-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/wit-boerderij1-leien-o-oud.png" width="521" height="584"/>
 </tile>
 <tile id="697">
  <properties>
    <property name="naam" value="wit-boerderij1-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/wit-boerderij1-leien-n-oud.png" width="574" height="513"/>
 </tile>
 <tile id="698">
  <properties>
    <property name="naam" value="wit-boerderij1-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/wit-boerderij1-leien-w-oud.png" width="522" height="576"/>
 </tile>
 <tile id="699">
  <properties>
    <property name="naam" value="wit-boerderij1-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/wit-boerderij1-pannen-z-oud.png" width="574" height="546"/>
 </tile>
 <tile id="700">
  <properties>
    <property name="naam" value="wit-boerderij1-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/wit-boerderij1-pannen-o-oud.png" width="522" height="584"/>
 </tile>
 <tile id="701">
  <properties>
    <property name="naam" value="wit-boerderij1-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/wit-boerderij1-pannen-n-oud.png" width="574" height="514"/>
 </tile>
 <tile id="702">
  <properties>
    <property name="naam" value="wit-boerderij1-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/wit-boerderij1-pannen-w-oud.png" width="523" height="576"/>
 </tile>
 <tile id="703">
  <properties>
    <property name="naam" value="wit-boerderij4-riet-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/wit-boerderij4-riet-z-oud.png" width="546" height="622"/>
 </tile>
 <tile id="704">
  <properties>
    <property name="naam" value="wit-boerderij4-riet-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,3"/>
  </properties>
  <image source="huizen/wit-boerderij4-riet-o-oud.png" width="546" height="633"/>
 </tile>
 <tile id="705">
  <properties>
    <property name="naam" value="wit-boerderij4-riet-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/wit-boerderij4-riet-n-oud.png" width="546" height="633"/>
 </tile>
 <tile id="706">
  <properties>
    <property name="naam" value="wit-boerderij4-riet-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/wit-boerderij4-riet-w-oud.png" width="546" height="622"/>
 </tile>
 <tile id="707">
  <properties>
    <property name="naam" value="wit-boerderij4-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/wit-boerderij4-leien-z-oud.png" width="518" height="575"/>
 </tile>
 <tile id="708">
  <properties>
    <property name="naam" value="wit-boerderij4-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,3"/>
  </properties>
  <image source="huizen/wit-boerderij4-leien-o-oud.png" width="518" height="586"/>
 </tile>
 <tile id="709">
  <properties>
    <property name="naam" value="wit-boerderij4-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/wit-boerderij4-leien-n-oud.png" width="518" height="586"/>
 </tile>
 <tile id="710">
  <properties>
    <property name="naam" value="wit-boerderij4-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/wit-boerderij4-leien-w-oud.png" width="518" height="575"/>
 </tile>
 <tile id="711">
  <properties>
    <property name="naam" value="wit-boerderij4-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/wit-boerderij4-pannen-z-oud.png" width="518" height="575"/>
 </tile>
 <tile id="712">
  <properties>
    <property name="naam" value="wit-boerderij4-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,3"/>
  </properties>
  <image source="huizen/wit-boerderij4-pannen-o-oud.png" width="518" height="586"/>
 </tile>
 <tile id="713">
  <properties>
    <property name="naam" value="wit-boerderij4-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/wit-boerderij4-pannen-n-oud.png" width="518" height="586"/>
 </tile>
 <tile id="714">
  <properties>
    <property name="naam" value="wit-boerderij4-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/wit-boerderij4-pannen-w-oud.png" width="518" height="575"/>
 </tile>
 <tile id="715">
  <properties>
    <property name="naam" value="wit-herberg1-riet-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="11x8"/>
    <property name="deur" value="5,8"/>
  </properties>
  <image source="huizen/wit-herberg1-riet-z-oud.png" width="610" height="629"/>
 </tile>
 <tile id="716">
  <properties>
    <property name="naam" value="wit-herberg1-riet-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x11"/>
    <property name="deur" value="8,5"/>
  </properties>
  <image source="huizen/wit-herberg1-riet-o-oud.png" width="623" height="629"/>
 </tile>
 <tile id="717">
  <properties>
    <property name="naam" value="wit-herberg1-riet-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="11x8"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/wit-herberg1-riet-n-oud.png" width="610" height="635"/>
 </tile>
 <tile id="718">
  <properties>
    <property name="naam" value="wit-herberg1-riet-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x11"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/wit-herberg1-riet-w-oud.png" width="623" height="629"/>
 </tile>
 <tile id="719">
  <properties>
    <property name="naam" value="wit-herberg2-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="5,6"/>
  </properties>
  <image source="huizen/wit-herberg2-leien-z-oud.png" width="683" height="750"/>
 </tile>
 <tile id="720">
  <properties>
    <property name="naam" value="wit-herberg2-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="6,6"/>
  </properties>
  <image source="huizen/wit-herberg2-leien-o-oud.png" width="683" height="750"/>
 </tile>
 <tile id="721">
  <properties>
    <property name="naam" value="wit-herberg2-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="6,-1"/>
  </properties>
  <image source="huizen/wit-herberg2-leien-n-oud.png" width="683" height="750"/>
 </tile>
 <tile id="722">
  <properties>
    <property name="naam" value="wit-herberg2-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/wit-herberg2-leien-w-oud.png" width="683" height="750"/>
 </tile>
 <tile id="723">
  <properties>
    <property name="naam" value="wit-herberg2-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="5,6"/>
  </properties>
  <image source="huizen/wit-herberg2-pannen-z-oud.png" width="683" height="706"/>
 </tile>
 <tile id="724">
  <properties>
    <property name="naam" value="wit-herberg2-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="6,6"/>
  </properties>
  <image source="huizen/wit-herberg2-pannen-o-oud.png" width="683" height="705"/>
 </tile>
 <tile id="725">
  <properties>
    <property name="naam" value="wit-herberg2-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="6,-1"/>
  </properties>
  <image source="huizen/wit-herberg2-pannen-n-oud.png" width="683" height="705"/>
 </tile>
 <tile id="726">
  <properties>
    <property name="naam" value="wit-herberg2-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/wit-herberg2-pannen-w-oud.png" width="683" height="706"/>
 </tile>
 <tile id="727">
  <properties>
    <property name="naam" value="wit-kapel-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="18x6"/>
    <property name="deur" value="14,6"/>
  </properties>
  <image source="huizen/wit-kapel-leien-z-oud.png" width="769" height="811"/>
 </tile>
 <tile id="728">
  <properties>
    <property name="naam" value="wit-kapel-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x18"/>
    <property name="deur" value="6,2"/>
  </properties>
  <image source="huizen/wit-kapel-leien-o-oud.png" width="771" height="997"/>
 </tile>
 <tile id="729">
  <properties>
    <property name="naam" value="wit-kapel-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="18x6"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/wit-kapel-leien-n-oud.png" width="769" height="1000"/>
 </tile>
 <tile id="730">
  <properties>
    <property name="naam" value="wit-kapel-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x18"/>
    <property name="deur" value="-1,14"/>
  </properties>
  <image source="huizen/wit-kapel-leien-w-oud.png" width="771" height="811"/>
 </tile>
 <tile id="731">
  <properties>
    <property name="naam" value="wit-kapel-baksteen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="18x6"/>
    <property name="deur" value="14,6"/>
  </properties>
  <image source="huizen/wit-kapel-baksteen-z-oud.png" width="769" height="811"/>
 </tile>
 <tile id="732">
  <properties>
    <property name="naam" value="wit-kapel-baksteen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x18"/>
    <property name="deur" value="6,2"/>
  </properties>
  <image source="huizen/wit-kapel-baksteen-o-oud.png" width="771" height="997"/>
 </tile>
 <tile id="733">
  <properties>
    <property name="naam" value="wit-kapel-baksteen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="18x6"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/wit-kapel-baksteen-n-oud.png" width="769" height="1000"/>
 </tile>
 <tile id="734">
  <properties>
    <property name="naam" value="wit-kapel-baksteen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x18"/>
    <property name="deur" value="-1,14"/>
  </properties>
  <image source="huizen/wit-kapel-baksteen-w-oud.png" width="771" height="811"/>
 </tile>
 <tile id="735">
  <properties>
    <property name="naam" value="wit-woontoren-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/wit-woontoren-pannen-z-oud.png" width="421" height="579"/>
 </tile>
 <tile id="736">
  <properties>
    <property name="naam" value="wit-woontoren-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="5,2"/>
  </properties>
  <image source="huizen/wit-woontoren-pannen-o-oud.png" width="421" height="574"/>
 </tile>
 <tile id="737">
  <properties>
    <property name="naam" value="wit-woontoren-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/wit-woontoren-pannen-n-oud.png" width="421" height="574"/>
 </tile>
 <tile id="738">
  <properties>
    <property name="naam" value="wit-woontoren-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/wit-woontoren-pannen-w-oud.png" width="421" height="588"/>
 </tile>
 <tile id="739">
  <properties>
    <property name="naam" value="wit-woontoren-baksteen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/wit-woontoren-baksteen-z-oud.png" width="421" height="579"/>
 </tile>
 <tile id="740">
  <properties>
    <property name="naam" value="wit-woontoren-baksteen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="5,2"/>
  </properties>
  <image source="huizen/wit-woontoren-baksteen-o-oud.png" width="421" height="574"/>
 </tile>
 <tile id="741">
  <properties>
    <property name="naam" value="wit-woontoren-baksteen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/wit-woontoren-baksteen-n-oud.png" width="421" height="574"/>
 </tile>
 <tile id="742">
  <properties>
    <property name="naam" value="wit-woontoren-baksteen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/wit-woontoren-baksteen-w-oud.png" width="421" height="588"/>
 </tile>
 <tile id="743">
  <properties>
    <property name="naam" value="wit-schoutshuis-riet-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/wit-schoutshuis-riet-z-oud.png" width="585" height="780"/>
 </tile>
 <tile id="744">
  <properties>
    <property name="naam" value="wit-schoutshuis-riet-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,3"/>
  </properties>
  <image source="huizen/wit-schoutshuis-riet-o-oud.png" width="585" height="770"/>
 </tile>
 <tile id="745">
  <properties>
    <property name="naam" value="wit-schoutshuis-riet-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/wit-schoutshuis-riet-n-oud.png" width="585" height="770"/>
 </tile>
 <tile id="746">
  <properties>
    <property name="naam" value="wit-schoutshuis-riet-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/wit-schoutshuis-riet-w-oud.png" width="585" height="780"/>
 </tile>
 <tile id="747">
  <properties>
    <property name="naam" value="oker-huis2-riet-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/oker-huis2-riet-z-oud.png" width="482" height="628"/>
 </tile>
 <tile id="748">
  <properties>
    <property name="naam" value="oker-huis2-riet-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/oker-huis2-riet-o-oud.png" width="482" height="633"/>
 </tile>
 <tile id="749">
  <properties>
    <property name="naam" value="oker-huis2-riet-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/oker-huis2-riet-n-oud.png" width="482" height="633"/>
 </tile>
 <tile id="750">
  <properties>
    <property name="naam" value="oker-huis2-riet-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/oker-huis2-riet-w-oud.png" width="482" height="628"/>
 </tile>
 <tile id="751">
  <properties>
    <property name="naam" value="oker-huis2-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/oker-huis2-leien-z-oud.png" width="452" height="581"/>
 </tile>
 <tile id="752">
  <properties>
    <property name="naam" value="oker-huis2-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/oker-huis2-leien-o-oud.png" width="452" height="584"/>
 </tile>
 <tile id="753">
  <properties>
    <property name="naam" value="oker-huis2-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/oker-huis2-leien-n-oud.png" width="452" height="587"/>
 </tile>
 <tile id="754">
  <properties>
    <property name="naam" value="oker-huis2-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/oker-huis2-leien-w-oud.png" width="452" height="581"/>
 </tile>
 <tile id="755">
  <properties>
    <property name="naam" value="oker-huis2-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/oker-huis2-pannen-z-oud.png" width="452" height="581"/>
 </tile>
 <tile id="756">
  <properties>
    <property name="naam" value="oker-huis2-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/oker-huis2-pannen-o-oud.png" width="452" height="584"/>
 </tile>
 <tile id="757">
  <properties>
    <property name="naam" value="oker-huis2-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/oker-huis2-pannen-n-oud.png" width="452" height="587"/>
 </tile>
 <tile id="758">
  <properties>
    <property name="naam" value="oker-huis2-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/oker-huis2-pannen-w-oud.png" width="452" height="581"/>
 </tile>
 <tile id="759">
  <properties>
    <property name="naam" value="oker-steen2-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/oker-steen2-leien-z-oud.png" width="452" height="581"/>
 </tile>
 <tile id="760">
  <properties>
    <property name="naam" value="oker-steen2-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/oker-steen2-leien-o-oud.png" width="452" height="584"/>
 </tile>
 <tile id="761">
  <properties>
    <property name="naam" value="oker-steen2-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/oker-steen2-leien-n-oud.png" width="452" height="587"/>
 </tile>
 <tile id="762">
  <properties>
    <property name="naam" value="oker-steen2-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/oker-steen2-leien-w-oud.png" width="452" height="581"/>
 </tile>
 <tile id="763">
  <properties>
    <property name="naam" value="oker-steen2-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/oker-steen2-pannen-z-oud.png" width="452" height="581"/>
 </tile>
 <tile id="764">
  <properties>
    <property name="naam" value="oker-steen2-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/oker-steen2-pannen-o-oud.png" width="452" height="584"/>
 </tile>
 <tile id="765">
  <properties>
    <property name="naam" value="oker-steen2-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/oker-steen2-pannen-n-oud.png" width="452" height="587"/>
 </tile>
 <tile id="766">
  <properties>
    <property name="naam" value="oker-steen2-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/oker-steen2-pannen-w-oud.png" width="452" height="581"/>
 </tile>
 <tile id="767">
  <properties>
    <property name="naam" value="oker-steen2-baksteen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/oker-steen2-baksteen-z-oud.png" width="452" height="581"/>
 </tile>
 <tile id="768">
  <properties>
    <property name="naam" value="oker-steen2-baksteen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/oker-steen2-baksteen-o-oud.png" width="452" height="584"/>
 </tile>
 <tile id="769">
  <properties>
    <property name="naam" value="oker-steen2-baksteen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/oker-steen2-baksteen-n-oud.png" width="452" height="587"/>
 </tile>
 <tile id="770">
  <properties>
    <property name="naam" value="oker-steen2-baksteen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/oker-steen2-baksteen-w-oud.png" width="452" height="581"/>
 </tile>
 <tile id="771">
  <properties>
    <property name="naam" value="oker-huis4-riet-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/oker-huis4-riet-z-oud.png" width="514" height="624"/>
 </tile>
 <tile id="772">
  <properties>
    <property name="naam" value="oker-huis4-riet-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/oker-huis4-riet-o-oud.png" width="614" height="565"/>
 </tile>
 <tile id="773">
  <properties>
    <property name="naam" value="oker-huis4-riet-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-huis4-riet-n-oud.png" width="514" height="616"/>
 </tile>
 <tile id="774">
  <properties>
    <property name="naam" value="oker-huis4-riet-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/oker-huis4-riet-w-oud.png" width="614" height="525"/>
 </tile>
 <tile id="775">
  <properties>
    <property name="naam" value="oker-huis4-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/oker-huis4-leien-z-oud.png" width="484" height="576"/>
 </tile>
 <tile id="776">
  <properties>
    <property name="naam" value="oker-huis4-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/oker-huis4-leien-o-oud.png" width="583" height="518"/>
 </tile>
 <tile id="777">
  <properties>
    <property name="naam" value="oker-huis4-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-huis4-leien-n-oud.png" width="485" height="583"/>
 </tile>
 <tile id="778">
  <properties>
    <property name="naam" value="oker-huis4-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/oker-huis4-leien-w-oud.png" width="583" height="485"/>
 </tile>
 <tile id="779">
  <properties>
    <property name="naam" value="oker-huis4-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/oker-huis4-pannen-z-oud.png" width="485" height="576"/>
 </tile>
 <tile id="780">
  <properties>
    <property name="naam" value="oker-huis4-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/oker-huis4-pannen-o-oud.png" width="583" height="518"/>
 </tile>
 <tile id="781">
  <properties>
    <property name="naam" value="oker-huis4-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-huis4-pannen-n-oud.png" width="485" height="583"/>
 </tile>
 <tile id="782">
  <properties>
    <property name="naam" value="oker-huis4-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/oker-huis4-pannen-w-oud.png" width="583" height="486"/>
 </tile>
 <tile id="783">
  <properties>
    <property name="naam" value="oker-steen4-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/oker-steen4-leien-z-oud.png" width="484" height="576"/>
 </tile>
 <tile id="784">
  <properties>
    <property name="naam" value="oker-steen4-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/oker-steen4-leien-o-oud.png" width="583" height="518"/>
 </tile>
 <tile id="785">
  <properties>
    <property name="naam" value="oker-steen4-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-steen4-leien-n-oud.png" width="485" height="583"/>
 </tile>
 <tile id="786">
  <properties>
    <property name="naam" value="oker-steen4-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/oker-steen4-leien-w-oud.png" width="583" height="485"/>
 </tile>
 <tile id="787">
  <properties>
    <property name="naam" value="oker-steen4-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/oker-steen4-pannen-z-oud.png" width="485" height="576"/>
 </tile>
 <tile id="788">
  <properties>
    <property name="naam" value="oker-steen4-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/oker-steen4-pannen-o-oud.png" width="583" height="518"/>
 </tile>
 <tile id="789">
  <properties>
    <property name="naam" value="oker-steen4-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-steen4-pannen-n-oud.png" width="485" height="583"/>
 </tile>
 <tile id="790">
  <properties>
    <property name="naam" value="oker-steen4-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/oker-steen4-pannen-w-oud.png" width="583" height="486"/>
 </tile>
 <tile id="791">
  <properties>
    <property name="naam" value="oker-steen4-baksteen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/oker-steen4-baksteen-z-oud.png" width="485" height="576"/>
 </tile>
 <tile id="792">
  <properties>
    <property name="naam" value="oker-steen4-baksteen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="8,3"/>
  </properties>
  <image source="huizen/oker-steen4-baksteen-o-oud.png" width="583" height="518"/>
 </tile>
 <tile id="793">
  <properties>
    <property name="naam" value="oker-steen4-baksteen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-steen4-baksteen-n-oud.png" width="485" height="583"/>
 </tile>
 <tile id="794">
  <properties>
    <property name="naam" value="oker-steen4-baksteen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/oker-steen4-baksteen-w-oud.png" width="583" height="486"/>
 </tile>
 <tile id="795">
  <properties>
    <property name="naam" value="oker-huis5-riet-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,5"/>
  </properties>
  <image source="huizen/oker-huis5-riet-z-oud.png" width="450" height="591"/>
 </tile>
 <tile id="796">
  <properties>
    <property name="naam" value="oker-huis5-riet-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,3"/>
  </properties>
  <image source="huizen/oker-huis5-riet-o-oud.png" width="450" height="593"/>
 </tile>
 <tile id="797">
  <properties>
    <property name="naam" value="oker-huis5-riet-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-huis5-riet-n-oud.png" width="450" height="614"/>
 </tile>
 <tile id="798">
  <properties>
    <property name="naam" value="oker-huis5-riet-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/oker-huis5-riet-w-oud.png" width="450" height="591"/>
 </tile>
 <tile id="799">
  <properties>
    <property name="naam" value="oker-huis5-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,5"/>
  </properties>
  <image source="huizen/oker-huis5-leien-z-oud.png" width="414" height="543"/>
 </tile>
 <tile id="800">
  <properties>
    <property name="naam" value="oker-huis5-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,3"/>
  </properties>
  <image source="huizen/oker-huis5-leien-o-oud.png" width="414" height="538"/>
 </tile>
 <tile id="801">
  <properties>
    <property name="naam" value="oker-huis5-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-huis5-leien-n-oud.png" width="414" height="561"/>
 </tile>
 <tile id="802">
  <properties>
    <property name="naam" value="oker-huis5-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/oker-huis5-leien-w-oud.png" width="414" height="543"/>
 </tile>
 <tile id="803">
  <properties>
    <property name="naam" value="oker-huis5-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,5"/>
  </properties>
  <image source="huizen/oker-huis5-pannen-z-oud.png" width="414" height="543"/>
 </tile>
 <tile id="804">
  <properties>
    <property name="naam" value="oker-huis5-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,3"/>
  </properties>
  <image source="huizen/oker-huis5-pannen-o-oud.png" width="414" height="538"/>
 </tile>
 <tile id="805">
  <properties>
    <property name="naam" value="oker-huis5-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-huis5-pannen-n-oud.png" width="414" height="561"/>
 </tile>
 <tile id="806">
  <properties>
    <property name="naam" value="oker-huis5-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/oker-huis5-pannen-w-oud.png" width="414" height="543"/>
 </tile>
 <tile id="807">
  <properties>
    <property name="naam" value="oker-steen5-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,5"/>
  </properties>
  <image source="huizen/oker-steen5-leien-z-oud.png" width="414" height="543"/>
 </tile>
 <tile id="808">
  <properties>
    <property name="naam" value="oker-steen5-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,3"/>
  </properties>
  <image source="huizen/oker-steen5-leien-o-oud.png" width="414" height="538"/>
 </tile>
 <tile id="809">
  <properties>
    <property name="naam" value="oker-steen5-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-steen5-leien-n-oud.png" width="414" height="561"/>
 </tile>
 <tile id="810">
  <properties>
    <property name="naam" value="oker-steen5-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/oker-steen5-leien-w-oud.png" width="414" height="543"/>
 </tile>
 <tile id="811">
  <properties>
    <property name="naam" value="oker-steen5-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,5"/>
  </properties>
  <image source="huizen/oker-steen5-pannen-z-oud.png" width="414" height="543"/>
 </tile>
 <tile id="812">
  <properties>
    <property name="naam" value="oker-steen5-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,3"/>
  </properties>
  <image source="huizen/oker-steen5-pannen-o-oud.png" width="414" height="538"/>
 </tile>
 <tile id="813">
  <properties>
    <property name="naam" value="oker-steen5-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-steen5-pannen-n-oud.png" width="414" height="561"/>
 </tile>
 <tile id="814">
  <properties>
    <property name="naam" value="oker-steen5-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/oker-steen5-pannen-w-oud.png" width="414" height="543"/>
 </tile>
 <tile id="815">
  <properties>
    <property name="naam" value="oker-steen5-baksteen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,5"/>
  </properties>
  <image source="huizen/oker-steen5-baksteen-z-oud.png" width="414" height="543"/>
 </tile>
 <tile id="816">
  <properties>
    <property name="naam" value="oker-steen5-baksteen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,3"/>
  </properties>
  <image source="huizen/oker-steen5-baksteen-o-oud.png" width="414" height="538"/>
 </tile>
 <tile id="817">
  <properties>
    <property name="naam" value="oker-steen5-baksteen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-steen5-baksteen-n-oud.png" width="414" height="561"/>
 </tile>
 <tile id="818">
  <properties>
    <property name="naam" value="oker-steen5-baksteen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/oker-steen5-baksteen-w-oud.png" width="414" height="543"/>
 </tile>
 <tile id="819">
  <properties>
    <property name="naam" value="oker-boerderij6-riet-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/oker-boerderij6-riet-z-oud.png" width="598" height="581"/>
 </tile>
 <tile id="820">
  <properties>
    <property name="naam" value="oker-boerderij6-riet-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x10"/>
    <property name="deur" value="8,5"/>
  </properties>
  <image source="huizen/oker-boerderij6-riet-o-oud.png" width="578" height="599"/>
 </tile>
 <tile id="821">
  <properties>
    <property name="naam" value="oker-boerderij6-riet-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x8"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/oker-boerderij6-riet-n-oud.png" width="598" height="589"/>
 </tile>
 <tile id="822">
  <properties>
    <property name="naam" value="oker-boerderij6-riet-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x10"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/oker-boerderij6-riet-w-oud.png" width="578" height="581"/>
 </tile>
 <tile id="823">
  <properties>
    <property name="naam" value="oker-boerderij6-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/oker-boerderij6-leien-z-oud.png" width="566" height="534"/>
 </tile>
 <tile id="824">
  <properties>
    <property name="naam" value="oker-boerderij6-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x10"/>
    <property name="deur" value="8,5"/>
  </properties>
  <image source="huizen/oker-boerderij6-leien-o-oud.png" width="546" height="551"/>
 </tile>
 <tile id="825">
  <properties>
    <property name="naam" value="oker-boerderij6-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x8"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/oker-boerderij6-leien-n-oud.png" width="566" height="548"/>
 </tile>
 <tile id="826">
  <properties>
    <property name="naam" value="oker-boerderij6-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x10"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/oker-boerderij6-leien-w-oud.png" width="546" height="534"/>
 </tile>
 <tile id="827">
  <properties>
    <property name="naam" value="oker-boerderij6-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/oker-boerderij6-pannen-z-oud.png" width="566" height="534"/>
 </tile>
 <tile id="828">
  <properties>
    <property name="naam" value="oker-boerderij6-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x10"/>
    <property name="deur" value="8,5"/>
  </properties>
  <image source="huizen/oker-boerderij6-pannen-o-oud.png" width="546" height="551"/>
 </tile>
 <tile id="829">
  <properties>
    <property name="naam" value="oker-boerderij6-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x8"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/oker-boerderij6-pannen-n-oud.png" width="566" height="548"/>
 </tile>
 <tile id="830">
  <properties>
    <property name="naam" value="oker-boerderij6-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x10"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/oker-boerderij6-pannen-w-oud.png" width="546" height="534"/>
 </tile>
 <tile id="831">
  <properties>
    <property name="naam" value="oker-boerderij7-riet-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="3,6"/>
  </properties>
  <image source="huizen/oker-boerderij7-riet-z-oud.png" width="578" height="673"/>
 </tile>
 <tile id="832">
  <properties>
    <property name="naam" value="oker-boerderij7-riet-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="6,5"/>
  </properties>
  <image source="huizen/oker-boerderij7-riet-o-oud.png" width="578" height="667"/>
 </tile>
 <tile id="833">
  <properties>
    <property name="naam" value="oker-boerderij7-riet-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/oker-boerderij7-riet-n-oud.png" width="578" height="667"/>
 </tile>
 <tile id="834">
  <properties>
    <property name="naam" value="oker-boerderij7-riet-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/oker-boerderij7-riet-w-oud.png" width="578" height="673"/>
 </tile>
 <tile id="835">
  <properties>
    <property name="naam" value="oker-boerderij7-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="3,6"/>
  </properties>
  <image source="huizen/oker-boerderij7-leien-z-oud.png" width="548" height="625"/>
 </tile>
 <tile id="836">
  <properties>
    <property name="naam" value="oker-boerderij7-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="6,5"/>
  </properties>
  <image source="huizen/oker-boerderij7-leien-o-oud.png" width="548" height="619"/>
 </tile>
 <tile id="837">
  <properties>
    <property name="naam" value="oker-boerderij7-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/oker-boerderij7-leien-n-oud.png" width="548" height="619"/>
 </tile>
 <tile id="838">
  <properties>
    <property name="naam" value="oker-boerderij7-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/oker-boerderij7-leien-w-oud.png" width="548" height="625"/>
 </tile>
 <tile id="839">
  <properties>
    <property name="naam" value="oker-boerderij7-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="3,6"/>
  </properties>
  <image source="huizen/oker-boerderij7-pannen-z-oud.png" width="548" height="625"/>
 </tile>
 <tile id="840">
  <properties>
    <property name="naam" value="oker-boerderij7-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="6,5"/>
  </properties>
  <image source="huizen/oker-boerderij7-pannen-o-oud.png" width="548" height="619"/>
 </tile>
 <tile id="841">
  <properties>
    <property name="naam" value="oker-boerderij7-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/oker-boerderij7-pannen-n-oud.png" width="548" height="619"/>
 </tile>
 <tile id="842">
  <properties>
    <property name="naam" value="oker-boerderij7-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/oker-boerderij7-pannen-w-oud.png" width="548" height="625"/>
 </tile>
 <tile id="843">
  <properties>
    <property name="naam" value="oker-herberg1-riet-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="11x8"/>
    <property name="deur" value="5,8"/>
  </properties>
  <image source="huizen/oker-herberg1-riet-z-oud.png" width="610" height="629"/>
 </tile>
 <tile id="844">
  <properties>
    <property name="naam" value="oker-herberg1-riet-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x11"/>
    <property name="deur" value="8,5"/>
  </properties>
  <image source="huizen/oker-herberg1-riet-o-oud.png" width="623" height="629"/>
 </tile>
 <tile id="845">
  <properties>
    <property name="naam" value="oker-herberg1-riet-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="11x8"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/oker-herberg1-riet-n-oud.png" width="610" height="635"/>
 </tile>
 <tile id="846">
  <properties>
    <property name="naam" value="oker-herberg1-riet-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x11"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/oker-herberg1-riet-w-oud.png" width="623" height="629"/>
 </tile>
 <tile id="847">
  <properties>
    <property name="naam" value="oker-herberg2-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="5,6"/>
  </properties>
  <image source="huizen/oker-herberg2-leien-z-oud.png" width="683" height="750"/>
 </tile>
 <tile id="848">
  <properties>
    <property name="naam" value="oker-herberg2-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="6,6"/>
  </properties>
  <image source="huizen/oker-herberg2-leien-o-oud.png" width="683" height="750"/>
 </tile>
 <tile id="849">
  <properties>
    <property name="naam" value="oker-herberg2-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="6,-1"/>
  </properties>
  <image source="huizen/oker-herberg2-leien-n-oud.png" width="683" height="750"/>
 </tile>
 <tile id="850">
  <properties>
    <property name="naam" value="oker-herberg2-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/oker-herberg2-leien-w-oud.png" width="683" height="750"/>
 </tile>
 <tile id="851">
  <properties>
    <property name="naam" value="oker-herberg2-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="5,6"/>
  </properties>
  <image source="huizen/oker-herberg2-pannen-z-oud.png" width="683" height="706"/>
 </tile>
 <tile id="852">
  <properties>
    <property name="naam" value="oker-herberg2-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="6,6"/>
  </properties>
  <image source="huizen/oker-herberg2-pannen-o-oud.png" width="683" height="705"/>
 </tile>
 <tile id="853">
  <properties>
    <property name="naam" value="oker-herberg2-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="6,-1"/>
  </properties>
  <image source="huizen/oker-herberg2-pannen-n-oud.png" width="683" height="705"/>
 </tile>
 <tile id="854">
  <properties>
    <property name="naam" value="oker-herberg2-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/oker-herberg2-pannen-w-oud.png" width="683" height="706"/>
 </tile>
 <tile id="855">
  <properties>
    <property name="naam" value="oker-kapel-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="17x6"/>
    <property name="deur" value="14,6"/>
  </properties>
  <image source="huizen/oker-kapel-leien-z-oud.png" width="729" height="1086"/>
 </tile>
 <tile id="856">
  <properties>
    <property name="naam" value="oker-kapel-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x17"/>
    <property name="deur" value="6,2"/>
  </properties>
  <image source="huizen/oker-kapel-leien-o-oud.png" width="735" height="1292"/>
 </tile>
 <tile id="857">
  <properties>
    <property name="naam" value="oker-kapel-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="17x6"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/oker-kapel-leien-n-oud.png" width="729" height="1295"/>
 </tile>
 <tile id="858">
  <properties>
    <property name="naam" value="oker-kapel-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x17"/>
    <property name="deur" value="-1,14"/>
  </properties>
  <image source="huizen/oker-kapel-leien-w-oud.png" width="735" height="1089"/>
 </tile>
 <tile id="859">
  <properties>
    <property name="naam" value="oker-kapel-baksteen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="17x6"/>
    <property name="deur" value="14,6"/>
  </properties>
  <image source="huizen/oker-kapel-baksteen-z-oud.png" width="729" height="1086"/>
 </tile>
 <tile id="860">
  <properties>
    <property name="naam" value="oker-kapel-baksteen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x17"/>
    <property name="deur" value="6,2"/>
  </properties>
  <image source="huizen/oker-kapel-baksteen-o-oud.png" width="735" height="1292"/>
 </tile>
 <tile id="861">
  <properties>
    <property name="naam" value="oker-kapel-baksteen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="17x6"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/oker-kapel-baksteen-n-oud.png" width="729" height="1295"/>
 </tile>
 <tile id="862">
  <properties>
    <property name="naam" value="oker-kapel-baksteen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x17"/>
    <property name="deur" value="-1,14"/>
  </properties>
  <image source="huizen/oker-kapel-baksteen-w-oud.png" width="735" height="1089"/>
 </tile>
 <tile id="863">
  <properties>
    <property name="naam" value="oker-woontoren-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/oker-woontoren-pannen-z-oud.png" width="421" height="579"/>
 </tile>
 <tile id="864">
  <properties>
    <property name="naam" value="oker-woontoren-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="5,2"/>
  </properties>
  <image source="huizen/oker-woontoren-pannen-o-oud.png" width="421" height="574"/>
 </tile>
 <tile id="865">
  <properties>
    <property name="naam" value="oker-woontoren-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/oker-woontoren-pannen-n-oud.png" width="421" height="574"/>
 </tile>
 <tile id="866">
  <properties>
    <property name="naam" value="oker-woontoren-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/oker-woontoren-pannen-w-oud.png" width="421" height="588"/>
 </tile>
 <tile id="867">
  <properties>
    <property name="naam" value="oker-woontoren-baksteen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/oker-woontoren-baksteen-z-oud.png" width="421" height="579"/>
 </tile>
 <tile id="868">
  <properties>
    <property name="naam" value="oker-woontoren-baksteen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="5,2"/>
  </properties>
  <image source="huizen/oker-woontoren-baksteen-o-oud.png" width="421" height="574"/>
 </tile>
 <tile id="869">
  <properties>
    <property name="naam" value="oker-woontoren-baksteen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/oker-woontoren-baksteen-n-oud.png" width="421" height="574"/>
 </tile>
 <tile id="870">
  <properties>
    <property name="naam" value="oker-woontoren-baksteen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/oker-woontoren-baksteen-w-oud.png" width="421" height="588"/>
 </tile>
 <tile id="871">
  <properties>
    <property name="naam" value="oker-schoutshuis-riet-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/oker-schoutshuis-riet-z-oud.png" width="585" height="780"/>
 </tile>
 <tile id="872">
  <properties>
    <property name="naam" value="oker-schoutshuis-riet-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,3"/>
  </properties>
  <image source="huizen/oker-schoutshuis-riet-o-oud.png" width="585" height="770"/>
 </tile>
 <tile id="873">
  <properties>
    <property name="naam" value="oker-schoutshuis-riet-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/oker-schoutshuis-riet-n-oud.png" width="585" height="770"/>
 </tile>
 <tile id="874">
  <properties>
    <property name="naam" value="oker-schoutshuis-riet-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/oker-schoutshuis-riet-w-oud.png" width="585" height="780"/>
 </tile>
 <tile id="875">
  <properties>
    <property name="naam" value="planken-hut1-spanen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x4"/>
    <property name="deur" value="2,4"/>
  </properties>
  <image source="huizen/planken-hut1-spanen-z-oud.png" width="349" height="372"/>
 </tile>
 <tile id="876">
  <properties>
    <property name="naam" value="planken-hut1-spanen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="4x6"/>
    <property name="deur" value="4,3"/>
  </properties>
  <image source="huizen/planken-hut1-spanen-o-oud.png" width="349" height="363"/>
 </tile>
 <tile id="877">
  <properties>
    <property name="naam" value="planken-hut1-spanen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x4"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/planken-hut1-spanen-n-oud.png" width="349" height="363"/>
 </tile>
 <tile id="878">
  <properties>
    <property name="naam" value="planken-hut1-spanen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="4x6"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/planken-hut1-spanen-w-oud.png" width="349" height="374"/>
 </tile>
 <tile id="879">
  <properties>
    <property name="naam" value="planken-hut3-spanen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x4"/>
    <property name="deur" value="3,4"/>
  </properties>
  <image source="huizen/planken-hut3-spanen-z-oud.png" width="380" height="386"/>
 </tile>
 <tile id="880">
  <properties>
    <property name="naam" value="planken-hut3-spanen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="4x6"/>
    <property name="deur" value="4,2"/>
  </properties>
  <image source="huizen/planken-hut3-spanen-o-oud.png" width="380" height="380"/>
 </tile>
 <tile id="881">
  <properties>
    <property name="naam" value="planken-hut3-spanen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x4"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/planken-hut3-spanen-n-oud.png" width="380" height="380"/>
 </tile>
 <tile id="882">
  <properties>
    <property name="naam" value="planken-hut3-spanen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="4x6"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/planken-hut3-spanen-w-oud.png" width="380" height="386"/>
 </tile>
 <tile id="883">
  <properties>
    <property name="naam" value="planken-hut4-spanen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x6"/>
    <property name="deur" value="5,6"/>
  </properties>
  <image source="huizen/planken-hut4-spanen-z-oud.png" width="382" height="415"/>
 </tile>
 <tile id="884">
  <properties>
    <property name="naam" value="planken-hut4-spanen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x6"/>
    <property name="deur" value="6,0"/>
  </properties>
  <image source="huizen/planken-hut4-spanen-o-oud.png" width="449" height="351"/>
 </tile>
 <tile id="885">
  <properties>
    <property name="naam" value="planken-hut4-spanen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x6"/>
    <property name="deur" value="0,-1"/>
  </properties>
  <image source="huizen/planken-hut4-spanen-n-oud.png" width="382" height="419"/>
 </tile>
 <tile id="886">
  <properties>
    <property name="naam" value="planken-hut4-spanen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x6"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/planken-hut4-spanen-w-oud.png" width="449" height="377"/>
 </tile>
 <tile id="887">
  <properties>
    <property name="naam" value="planken-huis7-spanen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-huis7-spanen-z-oud.png" width="556" height="708"/>
 </tile>
 <tile id="888">
  <properties>
    <property name="naam" value="planken-huis7-spanen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-huis7-spanen-o-oud.png" width="556" height="719"/>
 </tile>
 <tile id="889">
  <properties>
    <property name="naam" value="planken-huis7-spanen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-huis7-spanen-n-oud.png" width="556" height="717"/>
 </tile>
 <tile id="890">
  <properties>
    <property name="naam" value="planken-huis7-spanen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-huis7-spanen-w-oud.png" width="556" height="708"/>
 </tile>
 <tile id="891">
  <properties>
    <property name="naam" value="planken-huis7-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-huis7-leien-z-oud.png" width="556" height="708"/>
 </tile>
 <tile id="892">
  <properties>
    <property name="naam" value="planken-huis7-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-huis7-leien-o-oud.png" width="556" height="719"/>
 </tile>
 <tile id="893">
  <properties>
    <property name="naam" value="planken-huis7-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-huis7-leien-n-oud.png" width="556" height="717"/>
 </tile>
 <tile id="894">
  <properties>
    <property name="naam" value="planken-huis7-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-huis7-leien-w-oud.png" width="556" height="708"/>
 </tile>
 <tile id="895">
  <properties>
    <property name="naam" value="planken-huis7-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-huis7-pannen-z-oud.png" width="556" height="708"/>
 </tile>
 <tile id="896">
  <properties>
    <property name="naam" value="planken-huis7-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-huis7-pannen-o-oud.png" width="556" height="719"/>
 </tile>
 <tile id="897">
  <properties>
    <property name="naam" value="planken-huis7-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-huis7-pannen-n-oud.png" width="556" height="717"/>
 </tile>
 <tile id="898">
  <properties>
    <property name="naam" value="planken-huis7-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-huis7-pannen-w-oud.png" width="556" height="708"/>
 </tile>
 <tile id="899">
  <properties>
    <property name="naam" value="planken-steen7-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-steen7-leien-z-oud.png" width="556" height="708"/>
 </tile>
 <tile id="900">
  <properties>
    <property name="naam" value="planken-steen7-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-steen7-leien-o-oud.png" width="556" height="719"/>
 </tile>
 <tile id="901">
  <properties>
    <property name="naam" value="planken-steen7-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-steen7-leien-n-oud.png" width="556" height="717"/>
 </tile>
 <tile id="902">
  <properties>
    <property name="naam" value="planken-steen7-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-steen7-leien-w-oud.png" width="556" height="708"/>
 </tile>
 <tile id="903">
  <properties>
    <property name="naam" value="planken-steen7-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-steen7-pannen-z-oud.png" width="556" height="708"/>
 </tile>
 <tile id="904">
  <properties>
    <property name="naam" value="planken-steen7-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-steen7-pannen-o-oud.png" width="556" height="719"/>
 </tile>
 <tile id="905">
  <properties>
    <property name="naam" value="planken-steen7-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-steen7-pannen-n-oud.png" width="556" height="717"/>
 </tile>
 <tile id="906">
  <properties>
    <property name="naam" value="planken-steen7-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-steen7-pannen-w-oud.png" width="556" height="708"/>
 </tile>
 <tile id="907">
  <properties>
    <property name="naam" value="planken-steen7-baksteen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-steen7-baksteen-z-oud.png" width="556" height="708"/>
 </tile>
 <tile id="908">
  <properties>
    <property name="naam" value="planken-steen7-baksteen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-steen7-baksteen-o-oud.png" width="556" height="719"/>
 </tile>
 <tile id="909">
  <properties>
    <property name="naam" value="planken-steen7-baksteen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-steen7-baksteen-n-oud.png" width="556" height="717"/>
 </tile>
 <tile id="910">
  <properties>
    <property name="naam" value="planken-steen7-baksteen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-steen7-baksteen-w-oud.png" width="556" height="708"/>
 </tile>
 <tile id="911">
  <properties>
    <property name="naam" value="planken-huis8-spanen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-huis8-spanen-z-oud.png" width="545" height="639"/>
 </tile>
 <tile id="912">
  <properties>
    <property name="naam" value="planken-huis8-spanen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-huis8-spanen-o-oud.png" width="522" height="663"/>
 </tile>
 <tile id="913">
  <properties>
    <property name="naam" value="planken-huis8-spanen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-huis8-spanen-n-oud.png" width="545" height="593"/>
 </tile>
 <tile id="914">
  <properties>
    <property name="naam" value="planken-huis8-spanen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-huis8-spanen-w-oud.png" width="522" height="671"/>
 </tile>
 <tile id="915">
  <properties>
    <property name="naam" value="planken-huis8-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-huis8-leien-z-oud.png" width="545" height="639"/>
 </tile>
 <tile id="916">
  <properties>
    <property name="naam" value="planken-huis8-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-huis8-leien-o-oud.png" width="525" height="663"/>
 </tile>
 <tile id="917">
  <properties>
    <property name="naam" value="planken-huis8-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-huis8-leien-n-oud.png" width="545" height="595"/>
 </tile>
 <tile id="918">
  <properties>
    <property name="naam" value="planken-huis8-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-huis8-leien-w-oud.png" width="524" height="671"/>
 </tile>
 <tile id="919">
  <properties>
    <property name="naam" value="planken-huis8-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-huis8-pannen-z-oud.png" width="545" height="639"/>
 </tile>
 <tile id="920">
  <properties>
    <property name="naam" value="planken-huis8-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-huis8-pannen-o-oud.png" width="525" height="663"/>
 </tile>
 <tile id="921">
  <properties>
    <property name="naam" value="planken-huis8-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-huis8-pannen-n-oud.png" width="545" height="596"/>
 </tile>
 <tile id="922">
  <properties>
    <property name="naam" value="planken-huis8-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-huis8-pannen-w-oud.png" width="524" height="671"/>
 </tile>
 <tile id="923">
  <properties>
    <property name="naam" value="planken-steen8-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-steen8-leien-z-oud.png" width="545" height="639"/>
 </tile>
 <tile id="924">
  <properties>
    <property name="naam" value="planken-steen8-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-steen8-leien-o-oud.png" width="525" height="663"/>
 </tile>
 <tile id="925">
  <properties>
    <property name="naam" value="planken-steen8-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-steen8-leien-n-oud.png" width="545" height="595"/>
 </tile>
 <tile id="926">
  <properties>
    <property name="naam" value="planken-steen8-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-steen8-leien-w-oud.png" width="524" height="671"/>
 </tile>
 <tile id="927">
  <properties>
    <property name="naam" value="planken-steen8-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-steen8-pannen-z-oud.png" width="545" height="639"/>
 </tile>
 <tile id="928">
  <properties>
    <property name="naam" value="planken-steen8-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-steen8-pannen-o-oud.png" width="525" height="663"/>
 </tile>
 <tile id="929">
  <properties>
    <property name="naam" value="planken-steen8-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-steen8-pannen-n-oud.png" width="545" height="596"/>
 </tile>
 <tile id="930">
  <properties>
    <property name="naam" value="planken-steen8-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-steen8-pannen-w-oud.png" width="524" height="671"/>
 </tile>
 <tile id="931">
  <properties>
    <property name="naam" value="planken-steen8-baksteen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/planken-steen8-baksteen-z-oud.png" width="545" height="639"/>
 </tile>
 <tile id="932">
  <properties>
    <property name="naam" value="planken-steen8-baksteen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/planken-steen8-baksteen-o-oud.png" width="525" height="663"/>
 </tile>
 <tile id="933">
  <properties>
    <property name="naam" value="planken-steen8-baksteen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-steen8-baksteen-n-oud.png" width="545" height="596"/>
 </tile>
 <tile id="934">
  <properties>
    <property name="naam" value="planken-steen8-baksteen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-steen8-baksteen-w-oud.png" width="524" height="671"/>
 </tile>
 <tile id="935">
  <properties>
    <property name="naam" value="planken-huis9-spanen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/planken-huis9-spanen-z-oud.png" width="485" height="544"/>
 </tile>
 <tile id="936">
  <properties>
    <property name="naam" value="planken-huis9-spanen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,2"/>
  </properties>
  <image source="huizen/planken-huis9-spanen-o-oud.png" width="523" height="526"/>
 </tile>
 <tile id="937">
  <properties>
    <property name="naam" value="planken-huis9-spanen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/planken-huis9-spanen-n-oud.png" width="485" height="526"/>
 </tile>
 <tile id="938">
  <properties>
    <property name="naam" value="planken-huis9-spanen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/planken-huis9-spanen-w-oud.png" width="523" height="534"/>
 </tile>
 <tile id="939">
  <properties>
    <property name="naam" value="planken-huis9-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/planken-huis9-leien-z-oud.png" width="485" height="544"/>
 </tile>
 <tile id="940">
  <properties>
    <property name="naam" value="planken-huis9-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,2"/>
  </properties>
  <image source="huizen/planken-huis9-leien-o-oud.png" width="523" height="526"/>
 </tile>
 <tile id="941">
  <properties>
    <property name="naam" value="planken-huis9-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/planken-huis9-leien-n-oud.png" width="485" height="526"/>
 </tile>
 <tile id="942">
  <properties>
    <property name="naam" value="planken-huis9-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/planken-huis9-leien-w-oud.png" width="523" height="534"/>
 </tile>
 <tile id="943">
  <properties>
    <property name="naam" value="planken-huis9-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/planken-huis9-pannen-z-oud.png" width="485" height="544"/>
 </tile>
 <tile id="944">
  <properties>
    <property name="naam" value="planken-huis9-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,2"/>
  </properties>
  <image source="huizen/planken-huis9-pannen-o-oud.png" width="523" height="526"/>
 </tile>
 <tile id="945">
  <properties>
    <property name="naam" value="planken-huis9-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/planken-huis9-pannen-n-oud.png" width="485" height="526"/>
 </tile>
 <tile id="946">
  <properties>
    <property name="naam" value="planken-huis9-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/planken-huis9-pannen-w-oud.png" width="523" height="534"/>
 </tile>
 <tile id="947">
  <properties>
    <property name="naam" value="planken-steen9-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/planken-steen9-leien-z-oud.png" width="485" height="544"/>
 </tile>
 <tile id="948">
  <properties>
    <property name="naam" value="planken-steen9-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="7,1"/>
  </properties>
  <image source="huizen/planken-steen9-leien-o-oud.png" width="523" height="526"/>
 </tile>
 <tile id="949">
  <properties>
    <property name="naam" value="planken-steen9-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="1,-1"/>
  </properties>
  <image source="huizen/planken-steen9-leien-n-oud.png" width="485" height="526"/>
 </tile>
 <tile id="950">
  <properties>
    <property name="naam" value="planken-steen9-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/planken-steen9-leien-w-oud.png" width="523" height="527"/>
 </tile>
 <tile id="951">
  <properties>
    <property name="naam" value="planken-steen9-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/planken-steen9-pannen-z-oud.png" width="485" height="544"/>
 </tile>
 <tile id="952">
  <properties>
    <property name="naam" value="planken-steen9-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="7,1"/>
  </properties>
  <image source="huizen/planken-steen9-pannen-o-oud.png" width="523" height="526"/>
 </tile>
 <tile id="953">
  <properties>
    <property name="naam" value="planken-steen9-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="1,-1"/>
  </properties>
  <image source="huizen/planken-steen9-pannen-n-oud.png" width="485" height="526"/>
 </tile>
 <tile id="954">
  <properties>
    <property name="naam" value="planken-steen9-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/planken-steen9-pannen-w-oud.png" width="523" height="527"/>
 </tile>
 <tile id="955">
  <properties>
    <property name="naam" value="planken-steen9-baksteen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="6,7"/>
  </properties>
  <image source="huizen/planken-steen9-baksteen-z-oud.png" width="485" height="544"/>
 </tile>
 <tile id="956">
  <properties>
    <property name="naam" value="planken-steen9-baksteen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="7,1"/>
  </properties>
  <image source="huizen/planken-steen9-baksteen-o-oud.png" width="523" height="526"/>
 </tile>
 <tile id="957">
  <properties>
    <property name="naam" value="planken-steen9-baksteen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x7"/>
    <property name="deur" value="1,-1"/>
  </properties>
  <image source="huizen/planken-steen9-baksteen-n-oud.png" width="485" height="526"/>
 </tile>
 <tile id="958">
  <properties>
    <property name="naam" value="planken-steen9-baksteen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x8"/>
    <property name="deur" value="-1,6"/>
  </properties>
  <image source="huizen/planken-steen9-baksteen-w-oud.png" width="523" height="527"/>
 </tile>
 <tile id="959">
  <properties>
    <property name="naam" value="planken-boerderij2-spanen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/planken-boerderij2-spanen-z-oud.png" width="513" height="546"/>
 </tile>
 <tile id="960">
  <properties>
    <property name="naam" value="planken-boerderij2-spanen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,4"/>
  </properties>
  <image source="huizen/planken-boerderij2-spanen-o-oud.png" width="549" height="552"/>
 </tile>
 <tile id="961">
  <properties>
    <property name="naam" value="planken-boerderij2-spanen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-boerderij2-spanen-n-oud.png" width="512" height="574"/>
 </tile>
 <tile id="962">
  <properties>
    <property name="naam" value="planken-boerderij2-spanen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-boerderij2-spanen-w-oud.png" width="550" height="546"/>
 </tile>
 <tile id="963">
  <properties>
    <property name="naam" value="planken-boerderij2-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/planken-boerderij2-leien-z-oud.png" width="513" height="546"/>
 </tile>
 <tile id="964">
  <properties>
    <property name="naam" value="planken-boerderij2-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,4"/>
  </properties>
  <image source="huizen/planken-boerderij2-leien-o-oud.png" width="549" height="552"/>
 </tile>
 <tile id="965">
  <properties>
    <property name="naam" value="planken-boerderij2-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-boerderij2-leien-n-oud.png" width="512" height="574"/>
 </tile>
 <tile id="966">
  <properties>
    <property name="naam" value="planken-boerderij2-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-boerderij2-leien-w-oud.png" width="550" height="546"/>
 </tile>
 <tile id="967">
  <properties>
    <property name="naam" value="planken-boerderij2-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/planken-boerderij2-pannen-z-oud.png" width="513" height="546"/>
 </tile>
 <tile id="968">
  <properties>
    <property name="naam" value="planken-boerderij2-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,4"/>
  </properties>
  <image source="huizen/planken-boerderij2-pannen-o-oud.png" width="549" height="552"/>
 </tile>
 <tile id="969">
  <properties>
    <property name="naam" value="planken-boerderij2-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-boerderij2-pannen-n-oud.png" width="512" height="574"/>
 </tile>
 <tile id="970">
  <properties>
    <property name="naam" value="planken-boerderij2-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-boerderij2-pannen-w-oud.png" width="550" height="546"/>
 </tile>
 <tile id="971">
  <properties>
    <property name="naam" value="planken-boerderij5-spanen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/planken-boerderij5-spanen-z-oud.png" width="514" height="522"/>
 </tile>
 <tile id="972">
  <properties>
    <property name="naam" value="planken-boerderij5-spanen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="6,4"/>
  </properties>
  <image source="huizen/planken-boerderij5-spanen-o-oud.png" width="514" height="519"/>
 </tile>
 <tile id="973">
  <properties>
    <property name="naam" value="planken-boerderij5-spanen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-boerderij5-spanen-n-oud.png" width="514" height="528"/>
 </tile>
 <tile id="974">
  <properties>
    <property name="naam" value="planken-boerderij5-spanen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-boerderij5-spanen-w-oud.png" width="514" height="522"/>
 </tile>
 <tile id="975">
  <properties>
    <property name="naam" value="planken-boerderij5-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/planken-boerderij5-leien-z-oud.png" width="514" height="522"/>
 </tile>
 <tile id="976">
  <properties>
    <property name="naam" value="planken-boerderij5-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="6,4"/>
  </properties>
  <image source="huizen/planken-boerderij5-leien-o-oud.png" width="514" height="519"/>
 </tile>
 <tile id="977">
  <properties>
    <property name="naam" value="planken-boerderij5-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-boerderij5-leien-n-oud.png" width="514" height="528"/>
 </tile>
 <tile id="978">
  <properties>
    <property name="naam" value="planken-boerderij5-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-boerderij5-leien-w-oud.png" width="514" height="522"/>
 </tile>
 <tile id="979">
  <properties>
    <property name="naam" value="planken-boerderij5-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/planken-boerderij5-pannen-z-oud.png" width="514" height="522"/>
 </tile>
 <tile id="980">
  <properties>
    <property name="naam" value="planken-boerderij5-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="6,4"/>
  </properties>
  <image source="huizen/planken-boerderij5-pannen-o-oud.png" width="514" height="519"/>
 </tile>
 <tile id="981">
  <properties>
    <property name="naam" value="planken-boerderij5-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x6"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/planken-boerderij5-pannen-n-oud.png" width="514" height="528"/>
 </tile>
 <tile id="982">
  <properties>
    <property name="naam" value="planken-boerderij5-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-boerderij5-pannen-w-oud.png" width="514" height="522"/>
 </tile>
 <tile id="983">
  <properties>
    <property name="naam" value="planken-herberg1-spanen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="11x8"/>
    <property name="deur" value="5,8"/>
  </properties>
  <image source="huizen/planken-herberg1-spanen-z-oud.png" width="576" height="576"/>
 </tile>
 <tile id="984">
  <properties>
    <property name="naam" value="planken-herberg1-spanen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x11"/>
    <property name="deur" value="8,5"/>
  </properties>
  <image source="huizen/planken-herberg1-spanen-o-oud.png" width="590" height="576"/>
 </tile>
 <tile id="985">
  <properties>
    <property name="naam" value="planken-herberg1-spanen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="11x8"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/planken-herberg1-spanen-n-oud.png" width="576" height="582"/>
 </tile>
 <tile id="986">
  <properties>
    <property name="naam" value="planken-herberg1-spanen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x11"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/planken-herberg1-spanen-w-oud.png" width="590" height="576"/>
 </tile>
 <tile id="987">
  <properties>
    <property name="naam" value="planken-herberg2-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="5,6"/>
  </properties>
  <image source="huizen/planken-herberg2-leien-z-oud.png" width="683" height="750"/>
 </tile>
 <tile id="988">
  <properties>
    <property name="naam" value="planken-herberg2-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="6,6"/>
  </properties>
  <image source="huizen/planken-herberg2-leien-o-oud.png" width="683" height="750"/>
 </tile>
 <tile id="989">
  <properties>
    <property name="naam" value="planken-herberg2-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="6,-1"/>
  </properties>
  <image source="huizen/planken-herberg2-leien-n-oud.png" width="683" height="750"/>
 </tile>
 <tile id="990">
  <properties>
    <property name="naam" value="planken-herberg2-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/planken-herberg2-leien-w-oud.png" width="683" height="750"/>
 </tile>
 <tile id="991">
  <properties>
    <property name="naam" value="planken-herberg2-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="5,6"/>
  </properties>
  <image source="huizen/planken-herberg2-pannen-z-oud.png" width="683" height="706"/>
 </tile>
 <tile id="992">
  <properties>
    <property name="naam" value="planken-herberg2-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="6,6"/>
  </properties>
  <image source="huizen/planken-herberg2-pannen-o-oud.png" width="683" height="705"/>
 </tile>
 <tile id="993">
  <properties>
    <property name="naam" value="planken-herberg2-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="6,-1"/>
  </properties>
  <image source="huizen/planken-herberg2-pannen-n-oud.png" width="683" height="705"/>
 </tile>
 <tile id="994">
  <properties>
    <property name="naam" value="planken-herberg2-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/planken-herberg2-pannen-w-oud.png" width="683" height="706"/>
 </tile>
 <tile id="995">
  <properties>
    <property name="naam" value="planken-kapel-spanen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="17x6"/>
    <property name="deur" value="14,6"/>
  </properties>
  <image source="huizen/planken-kapel-spanen-z-oud.png" width="749" height="1086"/>
 </tile>
 <tile id="996">
  <properties>
    <property name="naam" value="planken-kapel-spanen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x17"/>
    <property name="deur" value="6,2"/>
  </properties>
  <image source="huizen/planken-kapel-spanen-o-oud.png" width="755" height="1292"/>
 </tile>
 <tile id="997">
  <properties>
    <property name="naam" value="planken-kapel-spanen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="17x6"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/planken-kapel-spanen-n-oud.png" width="749" height="1295"/>
 </tile>
 <tile id="998">
  <properties>
    <property name="naam" value="planken-kapel-spanen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x17"/>
    <property name="deur" value="-1,14"/>
  </properties>
  <image source="huizen/planken-kapel-spanen-w-oud.png" width="755" height="1089"/>
 </tile>
 <tile id="999">
  <properties>
    <property name="naam" value="planken-kapel-baksteen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="17x6"/>
    <property name="deur" value="14,6"/>
  </properties>
  <image source="huizen/planken-kapel-baksteen-z-oud.png" width="749" height="1086"/>
 </tile>
 <tile id="1000">
  <properties>
    <property name="naam" value="planken-kapel-baksteen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x17"/>
    <property name="deur" value="6,2"/>
  </properties>
  <image source="huizen/planken-kapel-baksteen-o-oud.png" width="755" height="1292"/>
 </tile>
 <tile id="1001">
  <properties>
    <property name="naam" value="planken-kapel-baksteen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="17x6"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/planken-kapel-baksteen-n-oud.png" width="749" height="1295"/>
 </tile>
 <tile id="1002">
  <properties>
    <property name="naam" value="planken-kapel-baksteen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x17"/>
    <property name="deur" value="-1,14"/>
  </properties>
  <image source="huizen/planken-kapel-baksteen-w-oud.png" width="755" height="1089"/>
 </tile>
 <tile id="1003">
  <properties>
    <property name="naam" value="planken-woontoren-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/planken-woontoren-pannen-z-oud.png" width="421" height="579"/>
 </tile>
 <tile id="1004">
  <properties>
    <property name="naam" value="planken-woontoren-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="5,2"/>
  </properties>
  <image source="huizen/planken-woontoren-pannen-o-oud.png" width="421" height="574"/>
 </tile>
 <tile id="1005">
  <properties>
    <property name="naam" value="planken-woontoren-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/planken-woontoren-pannen-n-oud.png" width="421" height="574"/>
 </tile>
 <tile id="1006">
  <properties>
    <property name="naam" value="planken-woontoren-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/planken-woontoren-pannen-w-oud.png" width="421" height="588"/>
 </tile>
 <tile id="1007">
  <properties>
    <property name="naam" value="planken-woontoren-baksteen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/planken-woontoren-baksteen-z-oud.png" width="421" height="579"/>
 </tile>
 <tile id="1008">
  <properties>
    <property name="naam" value="planken-woontoren-baksteen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="5,2"/>
  </properties>
  <image source="huizen/planken-woontoren-baksteen-o-oud.png" width="421" height="574"/>
 </tile>
 <tile id="1009">
  <properties>
    <property name="naam" value="planken-woontoren-baksteen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/planken-woontoren-baksteen-n-oud.png" width="421" height="574"/>
 </tile>
 <tile id="1010">
  <properties>
    <property name="naam" value="planken-woontoren-baksteen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/planken-woontoren-baksteen-w-oud.png" width="421" height="588"/>
 </tile>
 <tile id="1011">
  <properties>
    <property name="naam" value="planken-schoutshuis-spanen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/planken-schoutshuis-spanen-z-oud.png" width="551" height="733"/>
 </tile>
 <tile id="1012">
  <properties>
    <property name="naam" value="planken-schoutshuis-spanen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,3"/>
  </properties>
  <image source="huizen/planken-schoutshuis-spanen-o-oud.png" width="552" height="724"/>
 </tile>
 <tile id="1013">
  <properties>
    <property name="naam" value="planken-schoutshuis-spanen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/planken-schoutshuis-spanen-n-oud.png" width="552" height="724"/>
 </tile>
 <tile id="1014">
  <properties>
    <property name="naam" value="planken-schoutshuis-spanen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/planken-schoutshuis-spanen-w-oud.png" width="551" height="733"/>
 </tile>
 <tile id="1015">
  <properties>
    <property name="naam" value="roze-huis10-riet-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/roze-huis10-riet-z-oud.png" width="526" height="703"/>
 </tile>
 <tile id="1016">
  <properties>
    <property name="naam" value="roze-huis10-riet-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/roze-huis10-riet-o-oud.png" width="526" height="692"/>
 </tile>
 <tile id="1017">
  <properties>
    <property name="naam" value="roze-huis10-riet-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-huis10-riet-n-oud.png" width="526" height="692"/>
 </tile>
 <tile id="1018">
  <properties>
    <property name="naam" value="roze-huis10-riet-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/roze-huis10-riet-w-oud.png" width="526" height="703"/>
 </tile>
 <tile id="1019">
  <properties>
    <property name="naam" value="roze-huis10-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/roze-huis10-leien-z-oud.png" width="498" height="655"/>
 </tile>
 <tile id="1020">
  <properties>
    <property name="naam" value="roze-huis10-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/roze-huis10-leien-o-oud.png" width="498" height="645"/>
 </tile>
 <tile id="1021">
  <properties>
    <property name="naam" value="roze-huis10-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-huis10-leien-n-oud.png" width="498" height="645"/>
 </tile>
 <tile id="1022">
  <properties>
    <property name="naam" value="roze-huis10-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/roze-huis10-leien-w-oud.png" width="498" height="655"/>
 </tile>
 <tile id="1023">
  <properties>
    <property name="naam" value="roze-huis10-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/roze-huis10-pannen-z-oud.png" width="498" height="655"/>
 </tile>
 <tile id="1024">
  <properties>
    <property name="naam" value="roze-huis10-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/roze-huis10-pannen-o-oud.png" width="498" height="645"/>
 </tile>
 <tile id="1025">
  <properties>
    <property name="naam" value="roze-huis10-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-huis10-pannen-n-oud.png" width="498" height="645"/>
 </tile>
 <tile id="1026">
  <properties>
    <property name="naam" value="roze-huis10-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/roze-huis10-pannen-w-oud.png" width="498" height="655"/>
 </tile>
 <tile id="1027">
  <properties>
    <property name="naam" value="roze-steen10-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/roze-steen10-leien-z-oud.png" width="498" height="655"/>
 </tile>
 <tile id="1028">
  <properties>
    <property name="naam" value="roze-steen10-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/roze-steen10-leien-o-oud.png" width="498" height="645"/>
 </tile>
 <tile id="1029">
  <properties>
    <property name="naam" value="roze-steen10-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-steen10-leien-n-oud.png" width="498" height="645"/>
 </tile>
 <tile id="1030">
  <properties>
    <property name="naam" value="roze-steen10-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/roze-steen10-leien-w-oud.png" width="498" height="655"/>
 </tile>
 <tile id="1031">
  <properties>
    <property name="naam" value="roze-steen10-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/roze-steen10-pannen-z-oud.png" width="498" height="655"/>
 </tile>
 <tile id="1032">
  <properties>
    <property name="naam" value="roze-steen10-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/roze-steen10-pannen-o-oud.png" width="498" height="645"/>
 </tile>
 <tile id="1033">
  <properties>
    <property name="naam" value="roze-steen10-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-steen10-pannen-n-oud.png" width="498" height="645"/>
 </tile>
 <tile id="1034">
  <properties>
    <property name="naam" value="roze-steen10-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/roze-steen10-pannen-w-oud.png" width="498" height="655"/>
 </tile>
 <tile id="1035">
  <properties>
    <property name="naam" value="roze-steen10-baksteen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/roze-steen10-baksteen-z-oud.png" width="498" height="655"/>
 </tile>
 <tile id="1036">
  <properties>
    <property name="naam" value="roze-steen10-baksteen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="5,4"/>
  </properties>
  <image source="huizen/roze-steen10-baksteen-o-oud.png" width="498" height="645"/>
 </tile>
 <tile id="1037">
  <properties>
    <property name="naam" value="roze-steen10-baksteen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x5"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-steen10-baksteen-n-oud.png" width="498" height="645"/>
 </tile>
 <tile id="1038">
  <properties>
    <property name="naam" value="roze-steen10-baksteen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x7"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/roze-steen10-baksteen-w-oud.png" width="498" height="655"/>
 </tile>
 <tile id="1039">
  <properties>
    <property name="naam" value="roze-huis11-riet-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,6"/>
  </properties>
  <image source="huizen/roze-huis11-riet-z-oud.png" width="546" height="617"/>
 </tile>
 <tile id="1040">
  <properties>
    <property name="naam" value="roze-huis11-riet-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,4"/>
  </properties>
  <image source="huizen/roze-huis11-riet-o-oud.png" width="546" height="612"/>
 </tile>
 <tile id="1041">
  <properties>
    <property name="naam" value="roze-huis11-riet-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-huis11-riet-n-oud.png" width="546" height="612"/>
 </tile>
 <tile id="1042">
  <properties>
    <property name="naam" value="roze-huis11-riet-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/roze-huis11-riet-w-oud.png" width="546" height="617"/>
 </tile>
 <tile id="1043">
  <properties>
    <property name="naam" value="roze-huis11-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,6"/>
  </properties>
  <image source="huizen/roze-huis11-leien-z-oud.png" width="511" height="570"/>
 </tile>
 <tile id="1044">
  <properties>
    <property name="naam" value="roze-huis11-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,4"/>
  </properties>
  <image source="huizen/roze-huis11-leien-o-oud.png" width="511" height="565"/>
 </tile>
 <tile id="1045">
  <properties>
    <property name="naam" value="roze-huis11-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-huis11-leien-n-oud.png" width="511" height="565"/>
 </tile>
 <tile id="1046">
  <properties>
    <property name="naam" value="roze-huis11-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/roze-huis11-leien-w-oud.png" width="511" height="570"/>
 </tile>
 <tile id="1047">
  <properties>
    <property name="naam" value="roze-huis11-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,6"/>
  </properties>
  <image source="huizen/roze-huis11-pannen-z-oud.png" width="511" height="570"/>
 </tile>
 <tile id="1048">
  <properties>
    <property name="naam" value="roze-huis11-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,4"/>
  </properties>
  <image source="huizen/roze-huis11-pannen-o-oud.png" width="511" height="565"/>
 </tile>
 <tile id="1049">
  <properties>
    <property name="naam" value="roze-huis11-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-huis11-pannen-n-oud.png" width="511" height="565"/>
 </tile>
 <tile id="1050">
  <properties>
    <property name="naam" value="roze-huis11-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/roze-huis11-pannen-w-oud.png" width="511" height="570"/>
 </tile>
 <tile id="1051">
  <properties>
    <property name="naam" value="roze-steen11-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,6"/>
  </properties>
  <image source="huizen/roze-steen11-leien-z-oud.png" width="511" height="570"/>
 </tile>
 <tile id="1052">
  <properties>
    <property name="naam" value="roze-steen11-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,4"/>
  </properties>
  <image source="huizen/roze-steen11-leien-o-oud.png" width="511" height="565"/>
 </tile>
 <tile id="1053">
  <properties>
    <property name="naam" value="roze-steen11-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-steen11-leien-n-oud.png" width="511" height="565"/>
 </tile>
 <tile id="1054">
  <properties>
    <property name="naam" value="roze-steen11-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/roze-steen11-leien-w-oud.png" width="511" height="570"/>
 </tile>
 <tile id="1055">
  <properties>
    <property name="naam" value="roze-steen11-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,6"/>
  </properties>
  <image source="huizen/roze-steen11-pannen-z-oud.png" width="511" height="570"/>
 </tile>
 <tile id="1056">
  <properties>
    <property name="naam" value="roze-steen11-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,4"/>
  </properties>
  <image source="huizen/roze-steen11-pannen-o-oud.png" width="511" height="565"/>
 </tile>
 <tile id="1057">
  <properties>
    <property name="naam" value="roze-steen11-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-steen11-pannen-n-oud.png" width="511" height="565"/>
 </tile>
 <tile id="1058">
  <properties>
    <property name="naam" value="roze-steen11-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/roze-steen11-pannen-w-oud.png" width="511" height="570"/>
 </tile>
 <tile id="1059">
  <properties>
    <property name="naam" value="roze-steen11-baksteen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,6"/>
  </properties>
  <image source="huizen/roze-steen11-baksteen-z-oud.png" width="511" height="570"/>
 </tile>
 <tile id="1060">
  <properties>
    <property name="naam" value="roze-steen11-baksteen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,4"/>
  </properties>
  <image source="huizen/roze-steen11-baksteen-o-oud.png" width="511" height="565"/>
 </tile>
 <tile id="1061">
  <properties>
    <property name="naam" value="roze-steen11-baksteen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-steen11-baksteen-n-oud.png" width="511" height="565"/>
 </tile>
 <tile id="1062">
  <properties>
    <property name="naam" value="roze-steen11-baksteen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,3"/>
  </properties>
  <image source="huizen/roze-steen11-baksteen-w-oud.png" width="511" height="570"/>
 </tile>
 <tile id="1063">
  <properties>
    <property name="naam" value="roze-huis12-riet-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/roze-huis12-riet-z-oud.png" width="546" height="659"/>
 </tile>
 <tile id="1064">
  <properties>
    <property name="naam" value="roze-huis12-riet-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,4"/>
  </properties>
  <image source="huizen/roze-huis12-riet-o-oud.png" width="598" height="655"/>
 </tile>
 <tile id="1065">
  <properties>
    <property name="naam" value="roze-huis12-riet-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-huis12-riet-n-oud.png" width="546" height="681"/>
 </tile>
 <tile id="1066">
  <properties>
    <property name="naam" value="roze-huis12-riet-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-huis12-riet-w-oud.png" width="598" height="649"/>
 </tile>
 <tile id="1067">
  <properties>
    <property name="naam" value="roze-huis12-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/roze-huis12-leien-z-oud.png" width="513" height="610"/>
 </tile>
 <tile id="1068">
  <properties>
    <property name="naam" value="roze-huis12-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,4"/>
  </properties>
  <image source="huizen/roze-huis12-leien-o-oud.png" width="564" height="608"/>
 </tile>
 <tile id="1069">
  <properties>
    <property name="naam" value="roze-huis12-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-huis12-leien-n-oud.png" width="512" height="645"/>
 </tile>
 <tile id="1070">
  <properties>
    <property name="naam" value="roze-huis12-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-huis12-leien-w-oud.png" width="565" height="602"/>
 </tile>
 <tile id="1071">
  <properties>
    <property name="naam" value="roze-huis12-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/roze-huis12-pannen-z-oud.png" width="513" height="610"/>
 </tile>
 <tile id="1072">
  <properties>
    <property name="naam" value="roze-huis12-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,4"/>
  </properties>
  <image source="huizen/roze-huis12-pannen-o-oud.png" width="564" height="608"/>
 </tile>
 <tile id="1073">
  <properties>
    <property name="naam" value="roze-huis12-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-huis12-pannen-n-oud.png" width="512" height="645"/>
 </tile>
 <tile id="1074">
  <properties>
    <property name="naam" value="roze-huis12-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-huis12-pannen-w-oud.png" width="565" height="602"/>
 </tile>
 <tile id="1075">
  <properties>
    <property name="naam" value="roze-steen12-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/roze-steen12-leien-z-oud.png" width="513" height="610"/>
 </tile>
 <tile id="1076">
  <properties>
    <property name="naam" value="roze-steen12-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,4"/>
  </properties>
  <image source="huizen/roze-steen12-leien-o-oud.png" width="564" height="608"/>
 </tile>
 <tile id="1077">
  <properties>
    <property name="naam" value="roze-steen12-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-steen12-leien-n-oud.png" width="512" height="645"/>
 </tile>
 <tile id="1078">
  <properties>
    <property name="naam" value="roze-steen12-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-steen12-leien-w-oud.png" width="565" height="602"/>
 </tile>
 <tile id="1079">
  <properties>
    <property name="naam" value="roze-steen12-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/roze-steen12-pannen-z-oud.png" width="513" height="610"/>
 </tile>
 <tile id="1080">
  <properties>
    <property name="naam" value="roze-steen12-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,4"/>
  </properties>
  <image source="huizen/roze-steen12-pannen-o-oud.png" width="564" height="608"/>
 </tile>
 <tile id="1081">
  <properties>
    <property name="naam" value="roze-steen12-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-steen12-pannen-n-oud.png" width="512" height="645"/>
 </tile>
 <tile id="1082">
  <properties>
    <property name="naam" value="roze-steen12-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-steen12-pannen-w-oud.png" width="565" height="602"/>
 </tile>
 <tile id="1083">
  <properties>
    <property name="naam" value="roze-steen12-baksteen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,8"/>
  </properties>
  <image source="huizen/roze-steen12-baksteen-z-oud.png" width="513" height="610"/>
 </tile>
 <tile id="1084">
  <properties>
    <property name="naam" value="roze-steen12-baksteen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="8,4"/>
  </properties>
  <image source="huizen/roze-steen12-baksteen-o-oud.png" width="564" height="608"/>
 </tile>
 <tile id="1085">
  <properties>
    <property name="naam" value="roze-steen12-baksteen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x8"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-steen12-baksteen-n-oud.png" width="512" height="645"/>
 </tile>
 <tile id="1086">
  <properties>
    <property name="naam" value="roze-steen12-baksteen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-steen12-baksteen-w-oud.png" width="565" height="602"/>
 </tile>
 <tile id="1087">
  <properties>
    <property name="naam" value="roze-boerderij8-riet-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/roze-boerderij8-riet-z-oud.png" width="546" height="617"/>
 </tile>
 <tile id="1088">
  <properties>
    <property name="naam" value="roze-boerderij8-riet-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/roze-boerderij8-riet-o-oud.png" width="608" height="579"/>
 </tile>
 <tile id="1089">
  <properties>
    <property name="naam" value="roze-boerderij8-riet-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-boerderij8-riet-n-oud.png" width="546" height="609"/>
 </tile>
 <tile id="1090">
  <properties>
    <property name="naam" value="roze-boerderij8-riet-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-boerderij8-riet-w-oud.png" width="608" height="539"/>
 </tile>
 <tile id="1091">
  <properties>
    <property name="naam" value="roze-boerderij8-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/roze-boerderij8-leien-z-oud.png" width="523" height="569"/>
 </tile>
 <tile id="1092">
  <properties>
    <property name="naam" value="roze-boerderij8-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/roze-boerderij8-leien-o-oud.png" width="577" height="531"/>
 </tile>
 <tile id="1093">
  <properties>
    <property name="naam" value="roze-boerderij8-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-boerderij8-leien-n-oud.png" width="524" height="561"/>
 </tile>
 <tile id="1094">
  <properties>
    <property name="naam" value="roze-boerderij8-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-boerderij8-leien-w-oud.png" width="577" height="500"/>
 </tile>
 <tile id="1095">
  <properties>
    <property name="naam" value="roze-boerderij8-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,7"/>
  </properties>
  <image source="huizen/roze-boerderij8-pannen-z-oud.png" width="524" height="569"/>
 </tile>
 <tile id="1096">
  <properties>
    <property name="naam" value="roze-boerderij8-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="7,4"/>
  </properties>
  <image source="huizen/roze-boerderij8-pannen-o-oud.png" width="577" height="531"/>
 </tile>
 <tile id="1097">
  <properties>
    <property name="naam" value="roze-boerderij8-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="9x7"/>
    <property name="deur" value="4,-1"/>
  </properties>
  <image source="huizen/roze-boerderij8-pannen-n-oud.png" width="524" height="561"/>
 </tile>
 <tile id="1098">
  <properties>
    <property name="naam" value="roze-boerderij8-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="7x9"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-boerderij8-pannen-w-oud.png" width="577" height="501"/>
 </tile>
 <tile id="1099">
  <properties>
    <property name="naam" value="roze-boerderij9-riet-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/roze-boerderij9-riet-z-oud.png" width="610" height="703"/>
 </tile>
 <tile id="1100">
  <properties>
    <property name="naam" value="roze-boerderij9-riet-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x10"/>
    <property name="deur" value="6,5"/>
  </properties>
  <image source="huizen/roze-boerderij9-riet-o-oud.png" width="610" height="708"/>
 </tile>
 <tile id="1101">
  <properties>
    <property name="naam" value="roze-boerderij9-riet-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x6"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/roze-boerderij9-riet-n-oud.png" width="610" height="708"/>
 </tile>
 <tile id="1102">
  <properties>
    <property name="naam" value="roze-boerderij9-riet-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x10"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-boerderij9-riet-w-oud.png" width="610" height="703"/>
 </tile>
 <tile id="1103">
  <properties>
    <property name="naam" value="roze-boerderij9-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/roze-boerderij9-leien-z-oud.png" width="578" height="656"/>
 </tile>
 <tile id="1104">
  <properties>
    <property name="naam" value="roze-boerderij9-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x10"/>
    <property name="deur" value="6,5"/>
  </properties>
  <image source="huizen/roze-boerderij9-leien-o-oud.png" width="578" height="661"/>
 </tile>
 <tile id="1105">
  <properties>
    <property name="naam" value="roze-boerderij9-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x6"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/roze-boerderij9-leien-n-oud.png" width="578" height="661"/>
 </tile>
 <tile id="1106">
  <properties>
    <property name="naam" value="roze-boerderij9-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x10"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-boerderij9-leien-w-oud.png" width="578" height="656"/>
 </tile>
 <tile id="1107">
  <properties>
    <property name="naam" value="roze-boerderij9-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/roze-boerderij9-pannen-z-oud.png" width="578" height="656"/>
 </tile>
 <tile id="1108">
  <properties>
    <property name="naam" value="roze-boerderij9-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x10"/>
    <property name="deur" value="6,5"/>
  </properties>
  <image source="huizen/roze-boerderij9-pannen-o-oud.png" width="578" height="661"/>
 </tile>
 <tile id="1109">
  <properties>
    <property name="naam" value="roze-boerderij9-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="10x6"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/roze-boerderij9-pannen-n-oud.png" width="578" height="661"/>
 </tile>
 <tile id="1110">
  <properties>
    <property name="naam" value="roze-boerderij9-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x10"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-boerderij9-pannen-w-oud.png" width="578" height="656"/>
 </tile>
 <tile id="1111">
  <properties>
    <property name="naam" value="roze-herberg1-riet-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="11x8"/>
    <property name="deur" value="5,8"/>
  </properties>
  <image source="huizen/roze-herberg1-riet-z-oud.png" width="610" height="629"/>
 </tile>
 <tile id="1112">
  <properties>
    <property name="naam" value="roze-herberg1-riet-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x11"/>
    <property name="deur" value="8,5"/>
  </properties>
  <image source="huizen/roze-herberg1-riet-o-oud.png" width="623" height="629"/>
 </tile>
 <tile id="1113">
  <properties>
    <property name="naam" value="roze-herberg1-riet-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="11x8"/>
    <property name="deur" value="5,-1"/>
  </properties>
  <image source="huizen/roze-herberg1-riet-n-oud.png" width="610" height="635"/>
 </tile>
 <tile id="1114">
  <properties>
    <property name="naam" value="roze-herberg1-riet-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x11"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/roze-herberg1-riet-w-oud.png" width="623" height="629"/>
 </tile>
 <tile id="1115">
  <properties>
    <property name="naam" value="roze-herberg2-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="5,6"/>
  </properties>
  <image source="huizen/roze-herberg2-leien-z-oud.png" width="683" height="750"/>
 </tile>
 <tile id="1116">
  <properties>
    <property name="naam" value="roze-herberg2-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="6,6"/>
  </properties>
  <image source="huizen/roze-herberg2-leien-o-oud.png" width="683" height="750"/>
 </tile>
 <tile id="1117">
  <properties>
    <property name="naam" value="roze-herberg2-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="6,-1"/>
  </properties>
  <image source="huizen/roze-herberg2-leien-n-oud.png" width="683" height="750"/>
 </tile>
 <tile id="1118">
  <properties>
    <property name="naam" value="roze-herberg2-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/roze-herberg2-leien-w-oud.png" width="683" height="750"/>
 </tile>
 <tile id="1119">
  <properties>
    <property name="naam" value="roze-herberg2-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="5,6"/>
  </properties>
  <image source="huizen/roze-herberg2-pannen-z-oud.png" width="683" height="706"/>
 </tile>
 <tile id="1120">
  <properties>
    <property name="naam" value="roze-herberg2-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="6,6"/>
  </properties>
  <image source="huizen/roze-herberg2-pannen-o-oud.png" width="683" height="705"/>
 </tile>
 <tile id="1121">
  <properties>
    <property name="naam" value="roze-herberg2-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="12x6"/>
    <property name="deur" value="6,-1"/>
  </properties>
  <image source="huizen/roze-herberg2-pannen-n-oud.png" width="683" height="705"/>
 </tile>
 <tile id="1122">
  <properties>
    <property name="naam" value="roze-herberg2-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x12"/>
    <property name="deur" value="-1,5"/>
  </properties>
  <image source="huizen/roze-herberg2-pannen-w-oud.png" width="683" height="706"/>
 </tile>
 <tile id="1123">
  <properties>
    <property name="naam" value="roze-kapel-leien-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="18x6"/>
    <property name="deur" value="14,6"/>
  </properties>
  <image source="huizen/roze-kapel-leien-z-oud.png" width="769" height="811"/>
 </tile>
 <tile id="1124">
  <properties>
    <property name="naam" value="roze-kapel-leien-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x18"/>
    <property name="deur" value="6,2"/>
  </properties>
  <image source="huizen/roze-kapel-leien-o-oud.png" width="771" height="997"/>
 </tile>
 <tile id="1125">
  <properties>
    <property name="naam" value="roze-kapel-leien-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="18x6"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/roze-kapel-leien-n-oud.png" width="769" height="1000"/>
 </tile>
 <tile id="1126">
  <properties>
    <property name="naam" value="roze-kapel-leien-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x18"/>
    <property name="deur" value="-1,14"/>
  </properties>
  <image source="huizen/roze-kapel-leien-w-oud.png" width="771" height="811"/>
 </tile>
 <tile id="1127">
  <properties>
    <property name="naam" value="roze-kapel-baksteen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="18x6"/>
    <property name="deur" value="14,6"/>
  </properties>
  <image source="huizen/roze-kapel-baksteen-z-oud.png" width="769" height="811"/>
 </tile>
 <tile id="1128">
  <properties>
    <property name="naam" value="roze-kapel-baksteen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x18"/>
    <property name="deur" value="6,2"/>
  </properties>
  <image source="huizen/roze-kapel-baksteen-o-oud.png" width="771" height="997"/>
 </tile>
 <tile id="1129">
  <properties>
    <property name="naam" value="roze-kapel-baksteen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="18x6"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/roze-kapel-baksteen-n-oud.png" width="769" height="1000"/>
 </tile>
 <tile id="1130">
  <properties>
    <property name="naam" value="roze-kapel-baksteen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x18"/>
    <property name="deur" value="-1,14"/>
  </properties>
  <image source="huizen/roze-kapel-baksteen-w-oud.png" width="771" height="811"/>
 </tile>
 <tile id="1131">
  <properties>
    <property name="naam" value="roze-woontoren-pannen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/roze-woontoren-pannen-z-oud.png" width="421" height="579"/>
 </tile>
 <tile id="1132">
  <properties>
    <property name="naam" value="roze-woontoren-pannen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="5,2"/>
  </properties>
  <image source="huizen/roze-woontoren-pannen-o-oud.png" width="421" height="574"/>
 </tile>
 <tile id="1133">
  <properties>
    <property name="naam" value="roze-woontoren-pannen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/roze-woontoren-pannen-n-oud.png" width="421" height="574"/>
 </tile>
 <tile id="1134">
  <properties>
    <property name="naam" value="roze-woontoren-pannen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/roze-woontoren-pannen-w-oud.png" width="421" height="588"/>
 </tile>
 <tile id="1135">
  <properties>
    <property name="naam" value="roze-woontoren-baksteen-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,5"/>
  </properties>
  <image source="huizen/roze-woontoren-baksteen-z-oud.png" width="421" height="579"/>
 </tile>
 <tile id="1136">
  <properties>
    <property name="naam" value="roze-woontoren-baksteen-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="5,2"/>
  </properties>
  <image source="huizen/roze-woontoren-baksteen-o-oud.png" width="421" height="574"/>
 </tile>
 <tile id="1137">
  <properties>
    <property name="naam" value="roze-woontoren-baksteen-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="2,-1"/>
  </properties>
  <image source="huizen/roze-woontoren-baksteen-n-oud.png" width="421" height="574"/>
 </tile>
 <tile id="1138">
  <properties>
    <property name="naam" value="roze-woontoren-baksteen-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="deur" value="-1,2"/>
  </properties>
  <image source="huizen/roze-woontoren-baksteen-w-oud.png" width="421" height="588"/>
 </tile>
 <tile id="1139">
  <properties>
    <property name="naam" value="roze-schoutshuis-riet-z-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="4,6"/>
  </properties>
  <image source="huizen/roze-schoutshuis-riet-z-oud.png" width="585" height="780"/>
 </tile>
 <tile id="1140">
  <properties>
    <property name="naam" value="roze-schoutshuis-riet-o-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="6,3"/>
  </properties>
  <image source="huizen/roze-schoutshuis-riet-o-oud.png" width="585" height="770"/>
 </tile>
 <tile id="1141">
  <properties>
    <property name="naam" value="roze-schoutshuis-riet-n-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="8x6"/>
    <property name="deur" value="3,-1"/>
  </properties>
  <image source="huizen/roze-schoutshuis-riet-n-oud.png" width="585" height="770"/>
 </tile>
 <tile id="1142">
  <properties>
    <property name="naam" value="roze-schoutshuis-riet-w-oud"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="6x8"/>
    <property name="deur" value="-1,4"/>
  </properties>
  <image source="huizen/roze-schoutshuis-riet-w-oud.png" width="585" height="780"/>
 </tile>
 <tile id="1143">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1144">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1145">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1146">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1147">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1148">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1149">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1150">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1151">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1152">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1153">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1154">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1155">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1156">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1157">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1158">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1159">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1160">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1161">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1162">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1163">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1164">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1165">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1166">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1167">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1168">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1169">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1170">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1171">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1172">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1173">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1174">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1175">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1176">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1177">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1178">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1179">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1180">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1181">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1182">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1183">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1184">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1185">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1186">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1187">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1188">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1189">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1190">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1191">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1192">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1193">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1194">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1195">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1196">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1197">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1198">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1199">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1200">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1201">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1202">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1203">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1204">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1205">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1206">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1207">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1208">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1209">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1210">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1211">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1212">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1213">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1214">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1215">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1216">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1217">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1218">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1219">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1220">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1221">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1222">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1223">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1224">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1225">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1226">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1227">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1228">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1229">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1230">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1231">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1232">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1233">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1234">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1235">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1236">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1237">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1238">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1239">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1240">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1241">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1242">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1243">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1244">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1245">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1246">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1247">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1248">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1249">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1250">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1251">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1252">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1253">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1254">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1255">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1256">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1257">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1258">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1259">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1260">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1261">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1262">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1263">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1264">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1265">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1266">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1267">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1268">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1269">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1270">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1271">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1272">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1273">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1274">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1275">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1276">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1277">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1278">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="1279">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
</tileset>
