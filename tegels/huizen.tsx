<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.10" tiledversion="1.11.0" name="huizen" tilewidth="600" tileheight="709" tilecount="32" columns="0" objectalignment="bottom">
 <grid orientation="orthogonal" width="1" height="1"/>
 <properties>
  <property name="notitie" value="De huizen van de huizenbouwer (huizen.cjs, ronde 4b): hutten van vlechtwerk en huizen van vakwerk onder riet, de boerderijen en het huis van de schout. Zet ze neer op de tegel linksboven van hun voet (&quot;beslaat&quot;); &quot;deur&quot; is de tegel voor de deur, gerekend vanaf die tegel. Een plaatje per tekening (tegels/huizen/): het spel laadt een tekening pas als hij op de kaart staat. In Tiled staan de voorwerpen daardoor niet precies op hun plek; het spel zet ze neer met hun eigen anker (tegels.json)."/>
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
</tileset>
